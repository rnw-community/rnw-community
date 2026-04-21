import { Inject } from '@nestjs/common';
import { EMPTY, type Observable, catchError, concatMap, defer, finalize, isObservable, of, throwError } from 'rxjs';

import { LockBusyError, createLockResource$ } from '@rnw-community/lock-decorator';
import { emptyFn, isDefined } from '@rnw-community/shared';

import { createLockServiceStore } from '../create-lock-service-store';
import { LOCK_SERVICE_NOT_INJECTED_MESSAGE } from '../lock-service-not-injected-message.const';
import { resolveResources } from '../resolve-resources';
import { RESOURCE_SEPARATOR } from '../resource-separator.const';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { LockModeType } from '@rnw-community/lock-decorator';
import type { AbstractConstructor, MethodDecoratorType } from '@rnw-community/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
type ObservableReturningFn = (...args: readonly any[]) => Observable<unknown>;

type ObservableRecoveryType<TResult> = TResult extends Observable<infer TValue> ? TValue | Observable<TValue> : never;
type ObservableRecoveryFnType<K extends ObservableReturningFn> = (error: unknown) => ObservableRecoveryType<ReturnType<K>>;

class MethodThrownError extends Error {
    constructor(readonly cause: unknown) {
        super('method-thrown');
        this.name = 'MethodThrownError';
    }
}

const recoverFromAcquireError = <TResult>(
    error: unknown,
    mode: LockModeType,
    catchErrorFn$: ((error: unknown) => TResult | Observable<TResult>) | undefined
): Observable<unknown> => {
    let normalized: unknown = error;
    if (error instanceof LockBusyError) {
        if (mode === 'exclusive' && !isDefined(catchErrorFn$)) {
            return EMPTY;
        }
        const keys = error.key.split(RESOURCE_SEPARATOR).join(', ');
        normalized = new Error(`Lock not acquired for keys: ${keys}`);
    }
    if (isDefined(catchErrorFn$)) {
        const recovery = catchErrorFn$(normalized);

        return isObservable(recovery) ? (recovery as Observable<unknown>) : of(recovery);
    }
    throw normalized;
};

const recoverFromMethodError = <TResult>(
    error: unknown,
    catchErrorFn$: ((error: unknown) => TResult | Observable<TResult>) | undefined
): Observable<unknown> => {
    if (isDefined(catchErrorFn$)) {
        const recovery = catchErrorFn$(error);

        return isObservable(recovery) ? (recovery as Observable<unknown>) : of(recovery);
    }
    throw error;
};

export const createObservableLockDecorators = (
    serviceToken: AbstractConstructor<LockServiceInterface>,
    defaultDuration: number
) => {
    const serviceSymbol = Symbol('LockService');

    const makeDecorator =
        (mode: LockModeType) =>
        <K extends ObservableReturningFn, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            catchErrorFn$?: ObservableRecoveryFnType<K>,
            duration?: number
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            Inject(serviceToken)(target, serviceSymbol);

            const methodName = `${target.constructor.name}::${String(propertyKey)}`;
            const originalMethod = descriptor.value as unknown as (this: unknown, ...args: TArgs) => unknown;
            const effectiveDuration = duration ?? defaultDuration;

            descriptor.value = function observableLockDecorator(this: unknown, ...args: TArgs) {
                return defer(() => {
                    const lockService = (this as Record<symbol, unknown>)[serviceSymbol] as LockServiceInterface | undefined;
                    if (!isDefined(lockService)) {
                        throw new Error(LOCK_SERVICE_NOT_INJECTED_MESSAGE);
                    }
                    const resources = resolveResources(preLock, args);
                    const joinedKey = resources.join(RESOURCE_SEPARATOR);
                    const store = createLockServiceStore(lockService, effectiveDuration);
                    const resource$ = createLockResource$<TArgs>(store, mode, joinedKey);

                    return resource$
                        .acquire$({ className: '', methodName, args, logContext: methodName })
                        .pipe(
                            concatMap((handle) => {
                                const releaseOnce = (): void => {
                                    void Promise.resolve(handle.release()).catch(emptyFn);
                                };
                                let innerResult: unknown;
                                try {
                                    innerResult = originalMethod.apply(this, args);
                                } catch (err: unknown) {
                                    releaseOnce();
                                    throw new MethodThrownError(err);
                                }
                                if (!isObservable(innerResult)) {
                                    releaseOnce();
                                    throw new MethodThrownError(new Error(`Method ${methodName} does not return an observable`));
                                }

                                return innerResult.pipe(
                                    catchError((error: unknown) => throwError(() => new MethodThrownError(error))),
                                    finalize(releaseOnce)
                                );
                            }),
                            catchError((error: unknown) =>
                                error instanceof MethodThrownError
                                    ? recoverFromMethodError(error.cause, catchErrorFn$)
                                    : recoverFromAcquireError(error, mode, catchErrorFn$)
                            )
                        );
                });
            } as unknown as K;

            return descriptor;
        };

    return {
        SequentialLock$: makeDecorator('sequential'),
        ExclusiveLock$: makeDecorator('exclusive'),
    };
};
