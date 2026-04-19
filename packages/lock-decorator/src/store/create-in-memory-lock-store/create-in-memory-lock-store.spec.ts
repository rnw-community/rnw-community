import { describe, expect, it } from '@jest/globals';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';

import { createInMemoryLockStore } from './create-in-memory-lock-store';

describe('createInMemoryLockStore', () => {
    describe('monitoring counters', () => {
        it('exposes exclusiveHeldCount alongside sequentialChainCount', async () => {
            const store = createInMemoryLockStore();
            expect(store.exclusiveHeldCount()).toBe(0);

            const handle = await store.acquire('ex', 'exclusive');
            expect(store.exclusiveHeldCount()).toBe(1);

            handle.release();
            expect(store.exclusiveHeldCount()).toBe(0);
        });
    });

    describe('stale tail cleanup on terminal paths with no later acquirer', () => {
        it('cleans up the chain map after a timeout, once the holder releases, with no later acquirer', async () => {
            const store = createInMemoryLockStore();
            const holder = await store.acquire('t1', 'sequential');
            expect(store.sequentialChainCount()).toBe(1);

            const waiterThatTimesOut = store.acquire('t1', 'sequential', { timeoutMs: 10 });
            await expect(waiterThatTimesOut).rejects.toBeInstanceOf(LockAcquireTimeoutError);
            expect(store.sequentialChainCount()).toBe(1);

            holder.release();
            await new Promise((flush) => setTimeout(flush, 5));
            expect(store.sequentialChainCount()).toBe(0);
        });

        it('cleans up the chain map after an abort, once the holder releases, with no later acquirer', async () => {
            const store = createInMemoryLockStore();
            const holder = await store.acquire('t2', 'sequential');
            expect(store.sequentialChainCount()).toBe(1);

            const controller = new AbortController();
            const waiterThatAborts = store.acquire('t2', 'sequential', { signal: controller.signal });
            controller.abort();
            await expect(waiterThatAborts).rejects.toMatchObject({ name: 'AbortError' });
            expect(store.sequentialChainCount()).toBe(1);

            holder.release();
            await new Promise((flush) => setTimeout(flush, 5));
            expect(store.sequentialChainCount()).toBe(0);
        });
    });

    describe('sequential mode', () => {
        it('acquires a lock and releases it', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('k', 'sequential');
            expect(handle.key).toBe('k');
            expect(handle.mode).toBe('sequential');
            void handle.release();
        });

        it('runs concurrent sequential calls in FIFO order', async () => {
            const store = createInMemoryLockStore();
            const order: number[] = [];

            const h1 = await store.acquire('k', 'sequential');

            const p2 = store.acquire('k', 'sequential').then(async (handle) => {
                order.push(2);

                return handle.release();
            });
            const p3 = store.acquire('k', 'sequential').then(async (handle) => {
                order.push(3);

                return handle.release();
            });

            order.push(1);
            void h1.release();

            await Promise.all([p2, p3]);
            expect(order).toEqual([1, 2, 3]);
        });

        it('three concurrent sequential calls run in order', async () => {
            const store = createInMemoryLockStore();
            const order: number[] = [];

            const makeTask = (num: number): Promise<void> =>
                store.acquire('queue-key', 'sequential').then((handle) => {
                    order.push(num);

                    return handle.release();
                });

            await Promise.all([makeTask(1), makeTask(2), makeTask(3)]);
            expect(order).toEqual([1, 2, 3]);
        });

        it('different keys do not block each other', async () => {
            const store = createInMemoryLockStore();
            const h1 = await store.acquire('a', 'sequential');
            const h2 = await store.acquire('b', 'sequential');
            expect(h1.key).toBe('a');
            expect(h2.key).toBe('b');
            void h1.release();
            void h2.release();
        });

        it('cleans up chain map when last holder releases', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('cleanup', 'sequential');
            void handle.release();
            const h2 = await store.acquire('cleanup', 'sequential');
            expect(h2.key).toBe('cleanup');
            void h2.release();
        });

        it('rejects with LockAcquireTimeoutError when timeout expires', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('t', 'sequential');

            const err = await store.acquire('t', 'sequential', { timeoutMs: 10 }).catch((e: unknown) => e);
            expect(err).toBeInstanceOf(LockAcquireTimeoutError);
            expect((err as LockAcquireTimeoutError).key).toBe('t');
            expect((err as LockAcquireTimeoutError).timeoutMs).toBe(10);

            void handle.release();
        });

        it('rejects immediately if signal is already aborted', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('ab', 'sequential');

            const controller = new AbortController();
            controller.abort();

            await expect(store.acquire('ab', 'sequential', { signal: controller.signal })).rejects.toMatchObject({
                name: 'AbortError',
            });

            void handle.release();
        });

        it('rejects with AbortError when signal aborts during wait', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('sig', 'sequential');

            const controller = new AbortController();
            const waitPromise = store.acquire('sig', 'sequential', { signal: controller.signal });

            setTimeout(() => {
                controller.abort();
            }, 10);

            await expect(waitPromise).rejects.toMatchObject({ name: 'AbortError' });

            void handle.release();
        });

        it('abort while not the tail: chain remains for subsequent waiters', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('chain-abort', 'sequential');

            const controller = new AbortController();

            const p2 = store.acquire('chain-abort', 'sequential', { signal: controller.signal });
            const p3 = store.acquire('chain-abort', 'sequential');

            controller.abort();

            await expect(p2).rejects.toMatchObject({ name: 'AbortError' });

            void handle.release();
            const h3 = await p3;
            expect(h3.key).toBe('chain-abort');
            void h3.release();
        });

        it('pre-aborted signal while not the tail: chain remains for subsequent waiters', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('pre-chain-abort', 'sequential');

            const controller = new AbortController();
            controller.abort();

            const p2 = store.acquire('pre-chain-abort', 'sequential', { signal: controller.signal });
            const p3 = store.acquire('pre-chain-abort', 'sequential');

            await expect(p2).rejects.toMatchObject({ name: 'AbortError' });

            void handle.release();
            const h3 = await p3;
            expect(h3.key).toBe('pre-chain-abort');
            void h3.release();
        });

        it('REGRESSION: timed-out sole waiter must NOT let the next acquirer bypass the active holder', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('race', 'sequential');

            const timedOut = store.acquire('race', 'sequential', { timeoutMs: 10 });
            await expect(timedOut).rejects.toBeInstanceOf(LockAcquireTimeoutError);

            let cAcquired = false;
            const p3 = store.acquire('race', 'sequential').then((h3) => {
                cAcquired = true;

                return h3.release();
            });

            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 20));
            expect(cAcquired).toBe(false);

            void handle.release();
            await p3;
            expect(cAcquired).toBe(true);
        });

        it('REGRESSION: aborted sole waiter must NOT let the next acquirer bypass the active holder', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('abort-race', 'sequential');

            const controller = new AbortController();
            const aborted = store.acquire('abort-race', 'sequential', { signal: controller.signal });
            controller.abort();
            await expect(aborted).rejects.toMatchObject({ name: 'AbortError' });

            let cAcquired = false;
            const p3 = store.acquire('abort-race', 'sequential').then((h3) => {
                cAcquired = true;

                return h3.release();
            });

            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 20));
            expect(cAcquired).toBe(false);

            void handle.release();
            await p3;
            expect(cAcquired).toBe(true);
        });

        it('allows next waiter to proceed after timeout of previous waiter', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('next', 'sequential');

            const timedOut = store.acquire('next', 'sequential', { timeoutMs: 10 });

            const p3 = store.acquire('next', 'sequential');

            await expect(timedOut).rejects.toBeInstanceOf(LockAcquireTimeoutError);
            void handle.release();

            const h3 = await p3;
            expect(h3.key).toBe('next');
            void h3.release();
        });
    });

    describe('exclusive mode', () => {
        it('acquires and releases', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('ek', 'exclusive');
            expect(handle.key).toBe('ek');
            expect(handle.mode).toBe('exclusive');
            void handle.release();
        });

        it('throws LockBusyError if key already held', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('busy', 'exclusive');

            await expect(store.acquire('busy', 'exclusive')).rejects.toBeInstanceOf(LockBusyError);

            const err = await store.acquire('busy', 'exclusive').catch((e: unknown) => e);
            expect((err as LockBusyError).key).toBe('busy');

            void handle.release();
        });

        it('can re-acquire after release', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('reacquire', 'exclusive');
            void handle.release();
            const h2 = await store.acquire('reacquire', 'exclusive');
            expect(h2.key).toBe('reacquire');
            void h2.release();
        });

        it('different keys do not conflict', async () => {
            const store = createInMemoryLockStore();
            const h1 = await store.acquire('x', 'exclusive');
            const h2 = await store.acquire('y', 'exclusive');
            expect(h1.key).toBe('x');
            expect(h2.key).toBe('y');
            void h1.release();
            void h2.release();
        });

        it('is idempotent: double release on the same handle is a no-op', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('idem', 'exclusive');
            void handle.release();
            void handle.release();
            const h2 = await store.acquire('idem', 'exclusive');
            expect(h2.key).toBe('idem');
            void h2.release();
        });

        it('stale double-release does NOT evict a fresh holder of the same key', async () => {
            const store = createInMemoryLockStore();
            const h1 = await store.acquire('shared', 'exclusive');
            void h1.release();
            const h2 = await store.acquire('shared', 'exclusive');

            void h1.release();

            await expect(store.acquire('shared', 'exclusive')).rejects.toBeInstanceOf(LockBusyError);
            void h2.release();
        });
    });

    describe('sequential mode idempotency', () => {
        it('is idempotent: double release on the same handle is a no-op', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('seq-idem', 'sequential');
            void handle.release();
            void handle.release();
            const h2 = await store.acquire('seq-idem', 'sequential');
            expect(h2.key).toBe('seq-idem');
            void h2.release();
        });

        it('stale double-release does NOT disturb a fresh holder', async () => {
            const store = createInMemoryLockStore();
            const h1 = await store.acquire('seq-shared', 'sequential');
            void h1.release();
            const h2 = await store.acquire('seq-shared', 'sequential');
            void h1.release();
            let p3Done = false;
            const p3 = store.acquire('seq-shared', 'sequential').then((handle) => {
                p3Done = true;

                return handle.release();
            });
            // eslint-disable-next-line no-promise-executor-return
            await new Promise((resolve) => setTimeout(resolve, 5));
            expect(p3Done).toBe(false);
            void h2.release();
            await p3;
            expect(p3Done).toBe(true);
        });
    });
});
