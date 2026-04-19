import { describe, expect, it, jest } from '@jest/globals';

import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { createExclusiveLock } from './create-exclusive-lock';

import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';

describe('createExclusiveLock (stage-3)', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeCtx = (name: string | symbol): ClassMethodDecoratorContext<any, any> =>
        ({
            kind: 'method',
            name,
            static: false,
            private: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            access: { get: (): any => undefined },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as unknown as ClassMethodDecoratorContext<any, any>;

    it('wraps and calls original method (async)', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });
        const decorator = ExclusiveLock('ex-key');

        const original = async function (this: unknown, x: number): Promise<number> {
            return x * 3;
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('op')
        );

        class Svc {
            readonly op = wrapped;
        }

        expect(await new Svc().op(7)).toBe(21);
    });

    it('wraps a sync method', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });
        const decorator = ExclusiveLock('sync-ex');

        const original = function (this: unknown): string {
            return 'sync';
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('sync')
        );

        class Svc {
            readonly sync = wrapped;
        }

        expect(await new Svc().sync()).toBe('sync');
    });

    it('throws LockBusyError when lock already held', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });

        let releaseHeld!: () => void;
        const holdLock = new Promise<void>((resolve) => {
            releaseHeld = resolve;
        });

        const original = async function (this: unknown): Promise<void> {
            await holdLock;
        };

        const decorator = ExclusiveLock('busy-key');
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('op')
        );

        class Svc {
            readonly op = wrapped;
        }

        const svc = new Svc();
        const p1 = svc.op();

        await expect(svc.op()).rejects.toBeInstanceOf(LockBusyError);
        releaseHeld();
        await p1;
    });

    it('uses function key form', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        const decorator = ExclusiveLock((args: readonly [string]) => `ex:${args[0]}`);
        const original = async function (this: unknown, _id: string): Promise<void> {
            await Promise.resolve();
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('run')
        );

        class Svc {
            readonly run = wrapped;
        }

        await new Svc().run('xyz');
        expect(spy).toHaveBeenCalledWith('ex:xyz', 'exclusive', expect.anything());
    });

    it('uses object key form with static key', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        const decorator = ExclusiveLock({ key: 'obj-ex' });
        const original = async function (this: unknown): Promise<void> {
            await Promise.resolve();
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('run')
        );

        class Svc {
            readonly run = wrapped;
        }

        await new Svc().run();
        expect(spy).toHaveBeenCalledWith('obj-ex', 'exclusive', expect.anything());
    });

    it('swallows release errors silently', async () => {
        const releaseError = new Error('release boom');
        const mockHandle = {
            key: 'rel',
            mode: 'exclusive' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(releaseError),
        };

        const mockStore = {
            acquire: jest.fn<typeof mockHandle.release>().mockResolvedValue(mockHandle as never),
        } as unknown as LockStoreInterface;

        const ExclusiveLock = createExclusiveLock({ store: mockStore });
        const decorator = ExclusiveLock('rel');
        const original = async function (this: unknown): Promise<string> {
            return 'ok';
        };

        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('method')
        );

        class Svc {
            readonly method = wrapped;
        }

        const result = await new Svc().method();
        expect(result).toBe('ok');
    });

    it('propagates method errors', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });

        const original = async function (this: unknown): Promise<void> {
            throw new Error('ex fail');
        };

        const decorator = ExclusiveLock('efail');
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('fail')
        );

        class Svc {
            readonly fail = wrapped;
        }

        await expect(new Svc().fail()).rejects.toThrow('ex fail');
    });

    it('handles symbol method name in context', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createExclusiveLock({ store });
        const sym = Symbol('exOp');
        const original = async function (this: unknown): Promise<number> {
            return 99;
        };

        const decorator = ExclusiveLock('sym-ex');
        const wrapped = decorator(
            original as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx(sym)
        );

        expect(await wrapped()).toBe(99);
    });
});
