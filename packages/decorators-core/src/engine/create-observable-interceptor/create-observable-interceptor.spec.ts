import { describe, expect, it, jest } from '@jest/globals';
import { EMPTY, Observable, Subject, lastValueFrom, of, throwError } from 'rxjs';

import { completionObservableStrategy } from '../../strategy/completion-observable-strategy/completion-observable.strategy';

import { createObservableInterceptor } from './create-observable-interceptor';

import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';
import type { ResourceObservableInterface } from '../../interface/resource-observable.interface';

const makeHandleSpy = (): { readonly handle: ResourceHandleInterface; readonly release: jest.Mock } => {
    const release = jest.fn();
    const handle: ResourceHandleInterface = { release: release as unknown as ResourceHandleInterface['release'] };

    return { handle, release };
};

describe('createObservableInterceptor — no resource', () => {
    it('fires onSuccess per emission with observableStrategy (default)', async () => {
        expect.hasAssertions();
        const onSuccess = jest.fn();
        const Dec = createObservableInterceptor({ interceptor: { onSuccess } });

        class Service {
            // @ts-expect-error — decorator factory uses loose generics; test asserts runtime
            @Dec
            run(): Observable<number> {
                return of(1, 2, 3);
            }
        }
        await lastValueFrom(new Service().run());
        expect(onSuccess).toHaveBeenCalledTimes(3);
    });

    it('fires onError once when the Observable errors', async () => {
        expect.hasAssertions();
        const onError = jest.fn();
        const boom = new Error('stream-boom');
        const Dec = createObservableInterceptor({ interceptor: { onError } });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return throwError(() => boom);
            }
        }
        await expect(lastValueFrom(new Service().run())).rejects.toBe(boom);
        expect(onError).toHaveBeenCalledTimes(1);
    });
});

describe('createObservableInterceptor — with resource$', () => {
    it('acquires, invokes, releases on complete', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const acquire$ = jest.fn(() => of(handle));
        const resource$: ResourceObservableInterface = { acquire$ };
        const Dec = createObservableInterceptor({ interceptor: {}, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return of(42);
            }
        }
        const value = await lastValueFrom(new Service().run());
        expect(value).toBe(42);
        expect(acquire$).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('fires onError on acquire failure; method is never invoked; no release', async () => {
        expect.hasAssertions();
        const acquireBoom = new Error('acquire-boom');
        const methodSpy = jest.fn();
        const onError = jest.fn();
        const resource$: ResourceObservableInterface = {
            acquire$: () => throwError(() => acquireBoom),
        };
        const Dec = createObservableInterceptor({ interceptor: { onError }, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                methodSpy();

                return of(1);
            }
        }
        await expect(lastValueFrom(new Service().run())).rejects.toBe(acquireBoom);
        expect(methodSpy).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledTimes(1);
    });

    it('releases on stream error and fires onError exactly once (no double-fire)', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const methodBoom = new Error('method-boom');
        const onError = jest.fn();
        const resource$: ResourceObservableInterface = { acquire$: () => of(handle) };
        const Dec = createObservableInterceptor({ interceptor: { onError }, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return throwError(() => methodBoom);
            }
        }
        await expect(lastValueFrom(new Service().run())).rejects.toBe(methodBoom);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('releases on unsubscribe before complete', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const source = new Subject<number>();
        const resource$: ResourceObservableInterface = { acquire$: () => of(handle) };
        const Dec = createObservableInterceptor({ interceptor: {}, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return source;
            }
        }
        const subscription = new Service().run().subscribe();
        source.next(1);
        subscription.unsubscribe();
        await Promise.resolve();
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('fires onSuccess once (not per emission) with completionObservableStrategy', async () => {
        expect.hasAssertions();
        const { handle } = makeHandleSpy();
        const onSuccess = jest.fn();
        const resource$: ResourceObservableInterface = { acquire$: () => of(handle) };
        const Dec = createObservableInterceptor({
            interceptor: { onSuccess },
            strategies: [completionObservableStrategy],
            resource$,
        });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return of(1, 2, 3);
            }
        }
        await lastValueFrom(new Service().run());
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledWith(expect.anything(), 3, expect.any(Number));
    });

    it('no-resource EMPTY stream completes cleanly with observableStrategy', async () => {
        expect.hasAssertions();
        const Dec = createObservableInterceptor({ interceptor: {} });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<never> {
                return EMPTY;
            }
        }
        await lastValueFrom(new Service().run(), { defaultValue: undefined });
        expect(true).toBe(true);
    });

    it('acquire failure without onError hook still rejects the subscription cleanly', async () => {
        expect.hasAssertions();
        const acquireBoom = new Error('acquire-no-hook');
        const resource$: ResourceObservableInterface = {
            acquire$: () => throwError(() => acquireBoom),
        };
        const Dec = createObservableInterceptor({ interceptor: {}, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return of(1);
            }
        }
        await expect(lastValueFrom(new Service().run())).rejects.toBe(acquireBoom);
    });

    it('returns descriptor unchanged when applied to a non-function descriptor', () => {
        expect.hasAssertions();
        const Dec = createObservableInterceptor({ interceptor: {} });
        const descriptor = { value: 42, writable: true, enumerable: false, configurable: true };
        const result = (Dec as unknown as (t: object, p: string, d: typeof descriptor) => typeof descriptor)(
            {},
            'notAMethod',
            descriptor
        );
        expect(result).toBe(descriptor);
    });

    it('swallows onEnter throws and proceeds to invoke + release', async () => {
        expect.hasAssertions();
        const { handle, release } = makeHandleSpy();
        const resource$: ResourceObservableInterface = { acquire$: () => of(handle) };
        const onEnter = jest.fn(() => {
            throw new Error('enter-boom');
        });
        const onSuccess = jest.fn();
        const Dec = createObservableInterceptor({ interceptor: { onEnter, onSuccess }, resource$ });

        class Service {
            // @ts-expect-error — see note
            @Dec
            run(): Observable<number> {
                return of(7);
            }
        }
        await lastValueFrom(new Service().run());
        expect(onSuccess).toHaveBeenCalledTimes(1);
        expect(release).toHaveBeenCalledTimes(1);
    });
});
