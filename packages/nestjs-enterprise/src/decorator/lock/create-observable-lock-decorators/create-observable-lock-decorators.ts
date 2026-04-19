import { Inject } from '@nestjs/common';
import { EMPTY, type Observable, catchError, defer, isObservable, of } from 'rxjs';

import { LockBusyError } from '@rnw-community/lock-decorator';
import { runWithLock$ } from '@rnw-community/lock-decorator/rxjs';

import { isDefined, isNotEmptyArray } from '@rnw-community/shared';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import { RESOURCE_SEPARATOR, createLockServiceStore } from '../adapter/lock-service-store.adapter';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

type LockModeType = 'sequential' | 'exclusive';

const LOCK_SERVICE_NOT_INJECTED_MESSAGE =
    'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.';

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

const requireObservable = (result: unknown, methodName: string): Observable<unknown> => {
    if (!isObservable(result)) {
        throw new Error(`Method ${methodName} does not return an observable`);
    }
    return result as Observable<unknown>;
};

const recoverFromLockError = <TResult>(
    error: unknown,
    mode: LockModeType,
    catchErrorFn$: ((error: unknown) => TResult) | undefined
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
            const originalMethod = descriptor.value as unknown as (this: unknown, ...a: TArgs) => unknown;
            const effectiveDuration = duration ?? defaultDuration;

            descriptor.value = function (this: unknown, ...args: TArgs): TResult {
                const self = this;

                return defer(() => {
                    const lockService = (self as Record<symbol, unknown>)[serviceSymbol] as
                        | LockServiceInterface
                        | undefined;
                    if (!isDefined(lockService)) {
                        throw new Error(LOCK_SERVICE_NOT_INJECTED_MESSAGE);
                    }
                    const resources = resolveResources(preLock, args);
                    const joinedKey = resources.join(RESOURCE_SEPARATOR);
                    const store = createLockServiceStore(lockService, effectiveDuration);

                    return runWithLock$(store, joinedKey, mode, {}, () =>
                        requireObservable(originalMethod.apply(self, args), methodName)
                    ).pipe(catchError((error: unknown) => recoverFromLockError(error, mode, catchErrorFn$)));
                }) as TResult;
            } as K;

            return descriptor;
        };

    return {
        SequentialLock$: makeDecorator('sequential'),
        ExclusiveLock$: makeDecorator('exclusive'),
    };
};
