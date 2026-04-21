import { describe, expect, it, jest } from '@jest/globals';

import { createPromiseInterceptor } from './create-promise-interceptor';

import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';
import type { ResourceInterface } from '../../interface/resource.interface';

const makeHandleSpy = (): { readonly handle: ResourceHandleInterface; readonly release: jest.Mock } => {
    const release = jest.fn();
    const handle: ResourceHandleInterface = { release: release as unknown as ResourceHandleInterface['release'] };

    return { handle, release };
};

describe('createPromiseInterceptor — no resource', () => {
    it('invokes onEnter then onSuccess for a Promise-returning method and resolves the value', async () => {
        expect.hasAssertions();
        const events: string[] = [];
        const interceptor = {
            onEnter: () => events.push('enter'),
            onSuccess: (_ctx: unknown, result: unknown) => events.push(`success:${String(result)}`),
        };
        const Dec = createPromiseInterceptor({ interceptor });

        class Service {
            // @ts-expect-error — decorator factory uses TResult coerced to Awaited; test asserts runtime contract only
            @Dec
            async run(id: string): Promise<string> {
                return `ok-${id}`;
            }
        }
        expect(await new Service().run('42')).toBe('ok-42');
        expect(events).toEqual(['enter', 'success:ok-42']);
    });

    it('invokes onError on rejection and rethrows the original error', async () => {
        expect.hasAssertions();
        const onError = jest.fn();
        const boom = new Error('method-boom');
        const Dec = createPromiseInterceptor({ interceptor: { onError } });

        class Service {
            // @ts-expect-error — see note above
            @Dec
            async run(): Promise<void> {
                throw boom;
            }
        }
        await expect(new Service().run()).rejects.toBe(boom);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ methodName: 'run' }), boom, expect.any(Number));
    });

    it('passes durationMs >= 0 to onSuccess', async () => {
        expect.hasAssertions();
        const onSuccess = jest.fn();
        const Dec = createPromiseInterceptor({ interceptor: { onSuccess } });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<number> {
                return 1;
            }
        }
        await new Service().run();
        const [, , durationMs] = (onSuccess as jest.Mock).mock.calls[0] as [unknown, unknown, number];
        expect(typeof durationMs).toBe('number');
        expect(durationMs >= 0).toBe(true);
    });
});

describe('createPromiseInterceptor — with resource', () => {
    it('acquires the resource, invokes the method, releases on success', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const resource: ResourceInterface = { acquire: jest.fn(async () => handle) };

        const Dec = createPromiseInterceptor({ interceptor: {}, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<string> {
                return 'ok';
            }
        }
        expect(await new Service().run()).toBe('ok');
        expect(resource.acquire).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('fires onError on acquire failure and NEVER invokes the method', async () => {
        expect.hasAssertions();
        const acquireBoom = new Error('acquire-boom');
        const methodSpy = jest.fn();
        const onError = jest.fn();
        const resource: ResourceInterface = {
            acquire: async () => {
                throw acquireBoom;
            },
        };
        const Dec = createPromiseInterceptor({ interceptor: { onError }, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<void> {
                methodSpy();
            }
        }
        await expect(new Service().run()).rejects.toBe(acquireBoom);
        expect(methodSpy).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ methodName: 'run' }), acquireBoom, expect.any(Number));
    });

    it('releases the resource after the method throws, rethrowing the method error (NOT the release error)', async () => {
        expect.hasAssertions();
        const methodBoom = new Error('method-boom');
        const releaseBoom = new Error('release-boom');
        const release = jest.fn(() => {
            throw releaseBoom;
        });
        const resource: ResourceInterface = {
            acquire: async () => ({ release: release as unknown as ResourceHandleInterface['release'] }),
        };
        const Dec = createPromiseInterceptor({ interceptor: {}, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<void> {
                throw methodBoom;
            }
        }
        await expect(new Service().run()).rejects.toBe(methodBoom);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('releases the resource on success even when release throws', async () => {
        expect.hasAssertions();
        const release = jest.fn(() => {
            throw new Error('release-boom');
        });
        const resource: ResourceInterface = {
            acquire: async () => ({ release: release as unknown as ResourceHandleInterface['release'] }),
        };
        const Dec = createPromiseInterceptor({ interceptor: {}, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<string> {
                return 'ok';
            }
        }
        expect(await new Service().run()).toBe('ok');
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('returns descriptor unchanged when applied to a non-function descriptor', () => {
        expect.hasAssertions();
        const Dec = createPromiseInterceptor({ interceptor: {} });
        const descriptor = { value: 42, writable: true, enumerable: false, configurable: true };
        const result = (Dec as unknown as (t: object, p: string, d: typeof descriptor) => typeof descriptor)(
            {},
            'notAMethod',
            descriptor
        );
        expect(result).toBe(descriptor);
    });

    it('catches a synchronous throw from a non-async method body via the method-phase catch', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const resource: ResourceInterface<readonly unknown[]> = { acquire: async () => handle };
        const boom = new Error('sync-from-promise-method');
        const onError = jest.fn();
        const Dec = createPromiseInterceptor({ interceptor: { onError }, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Promise<void> {
                throw boom;
            }
        }
        await expect(new Service().run()).rejects.toBe(boom);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('swallows onEnter throws and proceeds to invoke + release', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const resource: ResourceInterface = { acquire: async () => handle };
        const onEnter = jest.fn(() => {
            throw new Error('enter-boom');
        });
        const onSuccess = jest.fn();
        const Dec = createPromiseInterceptor({ interceptor: { onEnter, onSuccess }, resource });

        class Service {
            // @ts-expect-error — see note
            @Dec
            async run(): Promise<string> {
                return 'ok';
            }
        }
        expect(await new Service().run()).toBe('ok');
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });
});
