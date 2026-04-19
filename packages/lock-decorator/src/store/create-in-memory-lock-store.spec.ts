import { describe, expect, it } from '@jest/globals';

import { LockAcquireTimeoutError } from '../error/lock-acquire-timeout.error';
import { LockBusyError } from '../error/lock-busy.error';
import { createInMemoryLockStore } from './create-in-memory-lock-store';

describe('createInMemoryLockStore', () => {
    describe('sequential mode', () => {
        it('acquires a lock and releases it', async () => {
            const store = createInMemoryLockStore();
            const handle = await store.acquire('k', 'sequential');
            expect(handle.key).toBe('k');
            expect(handle.mode).toBe('sequential');
            handle.release();
        });

        it('runs concurrent sequential calls in FIFO order', async () => {
            const store = createInMemoryLockStore();
            const order: number[] = [];

            // Acquire slot 1 immediately so 2 and 3 queue up behind it
            const h1 = await store.acquire('k', 'sequential');

            const p2 = store.acquire('k', 'sequential').then(async (h) => {
                order.push(2);
                h.release();
            });
            const p3 = store.acquire('k', 'sequential').then(async (h) => {
                order.push(3);
                h.release();
            });

            // Release slot 1, which unblocks 2 then 3
            order.push(1);
            h1.release();

            await Promise.all([p2, p3]);
            expect(order).toEqual([1, 2, 3]);
        });

        it('three concurrent sequential calls run in order', async () => {
            const store = createInMemoryLockStore();
            const order: number[] = [];

            const makeTask = (n: number): Promise<void> =>
                store.acquire('queue-key', 'sequential').then((h) => {
                    order.push(n);
                    h.release();
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
            h1.release();
            h2.release();
        });

        it('cleans up chain map when last holder releases', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('cleanup', 'sequential');
            h.release();
            // Second acquire should work fine (chain was cleaned up)
            const h2 = await store.acquire('cleanup', 'sequential');
            expect(h2.key).toBe('cleanup');
            h2.release();
        });

        it('rejects with LockAcquireTimeoutError when timeout expires', async () => {
            const store = createInMemoryLockStore();
            // Hold the lock so next waiter times out
            const h = await store.acquire('t', 'sequential');

            const err = await store.acquire('t', 'sequential', { timeoutMs: 10 }).catch((e: unknown) => e);
            expect(err).toBeInstanceOf(LockAcquireTimeoutError);
            expect((err as LockAcquireTimeoutError).key).toBe('t');
            expect((err as LockAcquireTimeoutError).timeoutMs).toBe(10);

            h.release();
        });

        it('rejects immediately if signal is already aborted', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('ab', 'sequential');

            const controller = new AbortController();
            controller.abort();

            await expect(store.acquire('ab', 'sequential', { signal: controller.signal })).rejects.toMatchObject({
                name: 'AbortError',
            });

            h.release();
        });

        it('rejects with AbortError when signal aborts during wait', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('sig', 'sequential');

            const controller = new AbortController();
            const waitPromise = store.acquire('sig', 'sequential', { signal: controller.signal });

            // Abort after a short delay
            setTimeout(() => {
                controller.abort();
            }, 10);

            await expect(waitPromise).rejects.toMatchObject({ name: 'AbortError' });

            h.release();
        });

        it('abort while not the tail: chain remains for subsequent waiters', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('chain-abort', 'sequential');

            const controller = new AbortController();

            // Waiter 2 will abort while waiter 3 is also waiting (waiter 3 is the tail)
            const p2 = store.acquire('chain-abort', 'sequential', { signal: controller.signal });
            const p3 = store.acquire('chain-abort', 'sequential');

            // Abort waiter 2 — nextTail for p2 is NOT the current chain tail (p3 is after it)
            controller.abort();

            await expect(p2).rejects.toMatchObject({ name: 'AbortError' });

            // Now release h so p3 can proceed
            h.release();
            const h3 = await p3;
            expect(h3.key).toBe('chain-abort');
            h3.release();
        });

        it('pre-aborted signal while not the tail: chain remains for subsequent waiters', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('pre-chain-abort', 'sequential');

            const controller = new AbortController();
            controller.abort(); // already aborted

            // Queue: h holds, p2 (pre-aborted), p3 waits
            const p2 = store.acquire('pre-chain-abort', 'sequential', { signal: controller.signal });
            const p3 = store.acquire('pre-chain-abort', 'sequential');

            await expect(p2).rejects.toMatchObject({ name: 'AbortError' });

            h.release();
            const h3 = await p3;
            expect(h3.key).toBe('pre-chain-abort');
            h3.release();
        });

        it('allows next waiter to proceed after timeout of previous waiter', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('next', 'sequential');

            // This one will time out
            const timedOut = store.acquire('next', 'sequential', { timeoutMs: 10 });

            // This one should still be able to acquire after h is released
            const p3 = store.acquire('next', 'sequential');

            await expect(timedOut).rejects.toBeInstanceOf(LockAcquireTimeoutError);
            h.release();

            const h3 = await p3;
            expect(h3.key).toBe('next');
            h3.release();
        });
    });

    describe('exclusive mode', () => {
        it('acquires and releases', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('ek', 'exclusive');
            expect(h.key).toBe('ek');
            expect(h.mode).toBe('exclusive');
            h.release();
        });

        it('throws LockBusyError if key already held', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('busy', 'exclusive');

            await expect(store.acquire('busy', 'exclusive')).rejects.toBeInstanceOf(LockBusyError);

            const err = await store.acquire('busy', 'exclusive').catch((e: unknown) => e);
            expect((err as LockBusyError).key).toBe('busy');

            h.release();
        });

        it('can re-acquire after release', async () => {
            const store = createInMemoryLockStore();
            const h = await store.acquire('reacquire', 'exclusive');
            h.release();
            const h2 = await store.acquire('reacquire', 'exclusive');
            expect(h2.key).toBe('reacquire');
            h2.release();
        });

        it('different keys do not conflict', async () => {
            const store = createInMemoryLockStore();
            const h1 = await store.acquire('x', 'exclusive');
            const h2 = await store.acquire('y', 'exclusive');
            expect(h1.key).toBe('x');
            expect(h2.key).toBe('y');
            h1.release();
            h2.release();
        });
    });
});
