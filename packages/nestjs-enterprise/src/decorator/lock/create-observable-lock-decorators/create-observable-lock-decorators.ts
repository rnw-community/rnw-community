import { Inject } from '@nestjs/common';
import { EMPTY, type Observable, catchError, concatMap, defer, finalize, from, isObservable, of } from 'rxjs';

import { LockBusyError, type LockHandleInterface } from '@rnw-community/lock-decorator';

import { isDefined, isNotEmptyArray } from '@rnw-community/shared';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import { RESOURCE_SEPARATOR, createLockServiceStore } from '../adapter/lock-service-store.adapter';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

type LockModeType = 'sequential' | 'exclusive';

const resolveResources = <TArgs extends unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    args: TArgs
): string[] => {
    const resources = Array.isArray(preLock) ? preLock : preLock(...args);
    if (!isNotEmptyArray(resources)) {
        throw new Error('Lock key is not defined');
    }
    return resources as string[];
};

export const createObservableLockDecorators = (
    serviceToken: AbstractConstructor<LockServiceInterface>,
    defaultDuration: number
) => {
    const serviceSymbol = Symbol('LockService');

    const makeDecorator =
        (mode: LockModeType) =>
        <K extends AnyFn, TResult, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            catchErrorFn$?: (error: unknown) => TResult,
            duration?: number
            // eslint-disable-next-line @typescript-eslint/max-params
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            Inject(serviceToken)(target, serviceSymbol);

            const methodName = `${target.constructor.name}::${String(propertyKey)}`;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = descriptor.value!;
            const effectiveDuration = duration ?? defaultDuration;

            // eslint-disable-next-line func-names
            descriptor.value = function (this: unknown, ...args: TArgs): TResult {
                const self = this;

                // eslint-disable-next-line max-statements
                return defer(() => {
                    const lockService = (self as Record<symbol, unknown>)[serviceSymbol] as LockServiceInterface | undefined;
                    if (lockService === undefined) {
                        throw new Error(
                            'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.'
                        );
                    }

                    const resources = resolveResources(preLock, args);
                    const joinedKey = resources.join(RESOURCE_SEPARATOR);
                    const store = createLockServiceStore(lockService, effectiveDuration);

                    return from(store.acquire(joinedKey, mode, {})).pipe(
                        concatMap((handle: LockHandleInterface) => {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            const result = (originalMethod as unknown as (this: unknown, ...a: TArgs) => unknown).apply(
                                self,
                                args
                            ) as Observable<unknown>;

                            if (!isObservable(result)) {
                                void handle.release();
                                throw new Error(`Method ${methodName} does not return an observable`);
                            }

                            return result.pipe(
                                finalize(() => {
                                    void Promise.resolve(handle.release()).catch(() => void 0);
                                })
                            );
                        })
                    );
                }).pipe(
                    catchError((error: unknown) => {
                        let normalized: unknown = error;
                        if (error instanceof LockBusyError) {
                            if (mode === 'exclusive' && !isDefined(catchErrorFn$)) {
                                return EMPTY;
                            }
                            const keys = error.key.split(RESOURCE_SEPARATOR).join(', ');
                            normalized = new Error(`Lock not acquired for keys: ${keys}`);
                        }
                        if (isDefined(catchErrorFn$)) {
                            return of(catchErrorFn$(normalized)) as unknown as Observable<unknown>;
                        }
                        throw normalized;
                    }),
                    // Flatten Observable<Observable<T>> from catchErrorFn$ if user returned an Observable
                    concatMap((value: unknown) => (isObservable(value) ? (value as Observable<unknown>) : of(value)))
                ) as TResult;
            } as K;

            return descriptor;
        };

    return {
        SequentialLock$: makeDecorator('sequential'),
        ExclusiveLock$: makeDecorator('exclusive'),
    };
};
