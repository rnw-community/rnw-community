import { describe, expect, it, jest } from '@jest/globals';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { createLegacySequentialLock } from './create-legacy-sequential-lock';

import type { LockStoreInterface } from '../../interface/lock-store.interface';

describe('createLegacySequentialLock (legacy decorator)', () => {
    it('wraps and calls original async method', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });

        class Svc {
            async work(x: number): Promise<number> {
                return x * 2;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['work'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly [number]>('lseq-key')(proto as object, 'work', descriptor);
        expect(result).toBeDefined();

        const svc = new Svc();
        svc.work = result.value as typeof svc.work;

        expect(await svc.work(10)).toBe(20);
    });

    it('rejects a sync method at call time (explicit async-only contract — no silent promisification)', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });

        class Svc {
            compute(x: number): number {
                return x + 1;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['compute'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly [number]>('sync-legacy')(proto as object, 'compute', descriptor);
        const svc = new Svc();
        svc.compute = result.value as typeof svc.compute;

        await expect(svc.compute(5) as unknown as Promise<number>).rejects.toThrow(
            'Locked method must return a Promise'
        );
    });

    it('uses function key form', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        class Svc {
            async fetch(id: string): Promise<string> {
                return `data:${id}`;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['fetch'],
            writable: true,
            configurable: true,
        };

        const keyFn = (args: readonly [string]): string => `entity:${args[0]}`;
        const result = SequentialLock<readonly [string]>(keyFn)(proto as object, 'fetch', descriptor);
        const svc = new Svc();
        svc.fetch = result.value as typeof svc.fetch;

        await svc.fetch('42');
        expect(spy).toHaveBeenCalledWith('entity:42', 'sequential', expect.anything());
    });

    it('uses object key form with timeoutMs', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        class Svc {
            async op(): Promise<void> {
                await Promise.resolve();
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['op'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly []>({ key: 'obj-lseq', timeoutMs: 200 })(
            proto as object,
            'op',
            descriptor
        );
        const svc = new Svc();
        svc.op = result.value as typeof svc.op;

        await svc.op();
        expect(spy).toHaveBeenCalledWith('obj-lseq', 'sequential', { timeoutMs: 200, signal: undefined });
    });

    it('runs sequential calls in FIFO order', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });
        const order: number[] = [];

        const makeDescriptor = (num: number): PropertyDescriptor => ({
            async value (this: unknown): Promise<void> {
                order.push(num);
            },
            writable: true,
            configurable: true,
        });

        class Svc {
            m1(): Promise<void> {
                return Promise.resolve();
            }
            m2(): Promise<void> {
                return Promise.resolve();
            }
            m3(): Promise<void> {
                return Promise.resolve();
            }
        }

        const proto = Svc.prototype as object;
        const r1 = SequentialLock<readonly []>('lfifo')(proto, 'm1', makeDescriptor(1));
        const r2 = SequentialLock<readonly []>('lfifo')(proto, 'm2', makeDescriptor(2));
        const r3 = SequentialLock<readonly []>('lfifo')(proto, 'm3', makeDescriptor(3));

        const svc = new Svc();
        await Promise.all([
            (r1.value as () => Promise<void>).call(svc),
            (r2.value as () => Promise<void>).call(svc),
            (r3.value as () => Promise<void>).call(svc),
        ]);

        expect(order).toEqual([1, 2, 3]);
    });

    it('propagates method errors and releases lock', async () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });

        class Svc {
            async fail(): Promise<void> {
                throw new Error('legacy fail');
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['fail'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly []>('lerr')(proto as object, 'fail', descriptor);
        const svc = new Svc();
        svc.fail = result.value as typeof svc.fail;

        await expect(svc.fail()).rejects.toThrow('legacy fail');

        const handle = await store.acquire('lerr', 'sequential');
        expect(handle.key).toBe('lerr');
        void handle.release();
    });

    it('swallows release errors silently', async () => {
        const releaseError = new Error('rel fail');
        const mockHandle = {
            key: 'lr',
            mode: 'sequential' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(releaseError),
        };
        const mockStore = {
            acquire: jest.fn<typeof mockHandle.release>().mockResolvedValue(mockHandle as never),
        } as unknown as LockStoreInterface;

        const SequentialLock = createLegacySequentialLock({ store: mockStore });

        class Svc {
            async work(): Promise<string> {
                return 'done';
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['work'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly []>('lr')(proto as object, 'work', descriptor);
        const svc = new Svc();
        svc.work = result.value as typeof svc.work;

        expect(await svc.work()).toBe('done');
    });

    it('returns original descriptor when value is not a function', () => {
        const store = createInMemoryLockStore();
        const SequentialLock = createLegacySequentialLock({ store });

        const descriptor: PropertyDescriptor = {
            get: (): string => 'prop',
            configurable: true,
        };

        const result = SequentialLock<readonly []>('noop')({} as object, 'prop', descriptor);
        expect(result).toBe(descriptor);
    });

    it('rejects with LockAcquireTimeoutError when timed out', async () => {
        const store = createInMemoryLockStore();
        const held = await store.acquire('lto', 'sequential');
        const SequentialLock = createLegacySequentialLock({ store });

        class Svc {
            async op(): Promise<void> {
                await Promise.resolve();
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['op'],
            writable: true,
            configurable: true,
        };

        const result = SequentialLock<readonly []>({ key: 'lto', timeoutMs: 10 })(proto as object, 'op', descriptor);
        const svc = new Svc();
        svc.op = result.value as typeof svc.op;

        await expect(svc.op()).rejects.toBeInstanceOf(LockAcquireTimeoutError);
        void held.release();
    });
});
