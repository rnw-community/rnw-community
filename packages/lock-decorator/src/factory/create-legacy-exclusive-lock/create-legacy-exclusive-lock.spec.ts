import { describe, expect, it, jest } from '@jest/globals';

import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { createLegacyExclusiveLock } from './create-legacy-exclusive-lock';

import type { LockStoreInterface } from '../../interface/lock-store.interface';

describe('createLegacyExclusiveLock (legacy decorator)', () => {
    it('wraps and calls original async method', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });

        class Svc {
            async work(x: number): Promise<number> {
                return x * 5;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['work'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly [number]>('lex-key')(proto as object, 'work', descriptor);
        const svc = new Svc();
        svc.work = result.value as typeof svc.work;

        expect(await svc.work(6)).toBe(30);
    });

    it('rejects a sync method at call time (explicit async-only contract — no silent promisification)', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });

        class Svc {
            greet(name: string): string {
                return `hi ${name}`;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['greet'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly [string]>('lex-sync')(proto as object, 'greet', descriptor);
        const svc = new Svc();
        svc.greet = result.value as typeof svc.greet;

        await expect(svc.greet('world') as unknown as Promise<string>).rejects.toThrow(
            'Locked method must return a Promise'
        );
    });

    it('throws LockBusyError when lock already held', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });

        let releaseHeld!: () => void;
        const holdLock = new Promise<void>((resolve) => {
            releaseHeld = resolve;
        });

        class Svc {
            async op(): Promise<void> {
                await holdLock;
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['op'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly []>('lex-busy')(proto as object, 'op', descriptor);
        const svc = new Svc();
        svc.op = result.value as typeof svc.op;

        const p1 = svc.op();
        await expect(svc.op()).rejects.toBeInstanceOf(LockBusyError);

        releaseHeld();
        await p1;
    });

    it('uses function key form', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        class Svc {
            async process(_id: string): Promise<void> {
                await Promise.resolve();
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['process'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly [string]>((args) => `lex:${args[0]}`)(
            proto as object,
            'process',
            descriptor
        );
        const svc = new Svc();
        svc.process = result.value as typeof svc.process;

        await svc.process('99');
        expect(spy).toHaveBeenCalledWith('lex:99', 'exclusive', expect.anything());
    });

    it('uses object key with function', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });
        const spy = jest.spyOn(store, 'acquire');

        class Svc {
            async run(_id: number): Promise<void> {
                await Promise.resolve();
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['run'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly [number]>({ key: (args) => `num:${args[0]}` })(
            proto as object,
            'run',
            descriptor
        );
        const svc = new Svc();
        svc.run = result.value as typeof svc.run;

        await svc.run(7);
        expect(spy).toHaveBeenCalledWith('num:7', 'exclusive', expect.anything());
    });

    it('swallows release errors silently', async () => {
        const releaseError = new Error('rel fail');
        const mockHandle = {
            key: 'ler',
            mode: 'exclusive' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(releaseError),
        };
        const mockStore = {
            acquire: jest.fn<typeof mockHandle.release>().mockResolvedValue(mockHandle as never),
        } as unknown as LockStoreInterface;

        const ExclusiveLock = createLegacyExclusiveLock({ store: mockStore });

        class Svc {
            async work(): Promise<string> {
                return 'ok';
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['work'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly []>('ler')(proto as object, 'work', descriptor);
        const svc = new Svc();
        svc.work = result.value as typeof svc.work;

        expect(await svc.work()).toBe('ok');
    });

    it('propagates method errors', async () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });

        class Svc {
            async fail(): Promise<void> {
                throw new Error('lex fail');
            }
        }

        const proto = Svc.prototype as unknown as Record<string, unknown>;
        const descriptor: PropertyDescriptor = {
            value: proto['fail'],
            writable: true,
            configurable: true,
        };

        const result = ExclusiveLock<readonly []>('lerr')(proto as object, 'fail', descriptor);
        const svc = new Svc();
        svc.fail = result.value as typeof svc.fail;

        await expect(svc.fail()).rejects.toThrow('lex fail');
    });

    it('returns original descriptor when value is not a function', () => {
        const store = createInMemoryLockStore();
        const ExclusiveLock = createLegacyExclusiveLock({ store });

        const descriptor: PropertyDescriptor = {
            get: (): string => 'value',
            configurable: true,
        };

        const result = ExclusiveLock<readonly []>('noop')({} as object, 'prop', descriptor);
        expect(result).toBe(descriptor);
    });
});
