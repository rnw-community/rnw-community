import { describe, expect, it, jest } from '@jest/globals';

import { LockAcquireTimeoutError } from '../error/lock-acquire-timeout.error';
import { createInMemoryLockStore } from '../store/create-in-memory-lock-store';
import type { LockStoreInterface } from '../interface/lock-store.interface';
import { createSequentialLock } from './create-sequential-lock';

describe('createSequentialLock (stage-3)', () => {
    // Minimal stage-3 context shim — our factory only uses it for the _context param
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeCtx = (name: string | symbol): ClassMethodDecoratorContext<any, any> =>
        ({
            kind: 'method',
            name,
            static: false,
            private: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            access: { get: (): any => undefined },
        }) as unknown as ClassMethodDecoratorContext<any, any>;

    it('wraps and calls original method (async)', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });
        const decorator = SequentialLock('my-key');

        const original = async function (this: unknown, x: number): Promise<number> {
            return x * 2;
        };

        const wrapped = decorator(original as (this: unknown, ...args: readonly unknown[]) => unknown, makeCtx('work'));

        class Svc {
            readonly work = wrapped;
        }

        const result = await new Svc().work(21);
        expect(result).toBe(42);
    });

    it('wraps a sync method (returns value through promise)', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });

        const original = function (this: unknown, x: number): number {
            return x + 1;
        };

        const wrapped = decorator(original as (this: unknown, ...args: readonly unknown[]) => unknown, makeCtx('add'));

        function decorator(
            fn: (this: unknown, ...args: readonly unknown[]) => unknown,
            ctx: ClassMethodDecoratorContext<unknown, (this: unknown, ...args: readonly unknown[]) => unknown>
        ): (this: unknown, ...args: readonly unknown[]) => Promise<unknown> {
            return SequentialLock('sync-key')(fn, ctx);
        }

        class Svc {
            readonly add = wrapped;
        }

        const result = await new Svc().add(5);
        expect(result).toBe(6);
    });

    it('uses function key form', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        const keyFn = (args: readonly [string]): string => `prefix:${args[0]}`;
        const decorator = SequentialLock(keyFn);

        const original = async function (this: unknown, _id: string): Promise<string> {
            return 'done';
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx('run')
        );

        class Svc {
            readonly run = wrapped;
        }

        await new Svc().run('abc');
        expect(spy).toHaveBeenCalledWith('prefix:abc', 'sequential', expect.anything());
    });

    it('uses object key form with timeoutMs', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        const decorator = SequentialLock({ key: 'obj-key', timeoutMs: 500 });
        const original = async function (this: unknown): Promise<void> {
            return;
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx('run')
        );

        class Svc {
            readonly run = wrapped;
        }

        await new Svc().run();
        expect(spy).toHaveBeenCalledWith('obj-key', 'sequential', { timeoutMs: 500 });
    });

    it('runs sequential calls in FIFO order', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });
        const order: number[] = [];

        const makeMethod = (n: number): ((this: unknown) => Promise<void>) =>
            async function (this: unknown): Promise<void> {
                order.push(n);
            };

        const decorator = SequentialLock('fifo');
        class Svc {}

        const wrapped1 = decorator(makeMethod(1), makeCtx('m1'));
        const wrapped2 = decorator(makeMethod(2), makeCtx('m2'));
        const wrapped3 = decorator(makeMethod(3), makeCtx('m3'));

        const svc = new Svc();
        await Promise.all([wrapped1.call(svc), wrapped2.call(svc), wrapped3.call(svc)]);

        expect(order).toEqual([1, 2, 3]);
    });

    it('propagates method errors and releases lock', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });

        const original = async function (this: unknown): Promise<void> {
            throw new Error('method failed');
        };

        const decorator = SequentialLock('err-key');
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx('fail')
        );

        class Svc {
            readonly fail = wrapped;
        }

        await expect(new Svc().fail()).rejects.toThrow('method failed');

        // Lock should be released; next acquire should succeed
        const h = await store.acquire('err-key', 'sequential');
        expect(h.key).toBe('err-key');
        h.release();
    });

    it('swallows release errors silently', async () => {
        const releaseError = new Error('release boom');
        const mockHandle = {
            key: 'r',
            mode: 'sequential' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(releaseError),
        };

        const mockStore = {
            acquire: jest.fn<typeof mockHandle.release>().mockResolvedValue(mockHandle as never),
        } as unknown as LockStoreInterface;

        const SequentialLock = createSequentialLock({ store: mockStore });
        const decorator = SequentialLock('r');
        const original = async function (this: unknown): Promise<string> {
            return 'ok';
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx('m')
        );

        class Svc {
            readonly m = wrapped;
        }

        // Should NOT throw even though release fails
        const result = await new Svc().m();
        expect(result).toBe('ok');
    });

    it('rejects with LockAcquireTimeoutError when timed out', async () => {
        const store = createInMemoryLockStore();
        // Hold the lock
        const h = await store.acquire('to', 'sequential');

        const SequentialLock = createSequentialLock({ store });
        const decorator = SequentialLock({ key: 'to', timeoutMs: 10 });
        const original = async function (this: unknown): Promise<void> {
            return;
        };
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx('m')
        );

        class Svc {
            readonly m = wrapped;
        }

        await expect(new Svc().m()).rejects.toBeInstanceOf(LockAcquireTimeoutError);
        h.release();
    });

    it('handles symbol method name in context', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createSequentialLock({ store });
        const sym = Symbol('myMethod');
        const original = async function (this: unknown): Promise<number> {
            return 1;
        };

        const decorator = SequentialLock('sym-key');
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
            makeCtx(sym)
        );

        const result = await wrapped.call(null);
        expect(result).toBe(1);
    });
});
