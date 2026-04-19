import { Inject } from '@nestjs/common';
import { runWithLock$ } from '@rnw-community/lock-decorator/rxjs';
import { EMPTY, type Observable, catchError, defer, isObservable, of } from 'rxjs';

import { LockBusyError } from '@rnw-community/lock-decorator';
import { isDefined } from '@rnw-community/shared';

import { createLockServiceStore } from '../create-lock-service-store';
import { LOCK_SERVICE_NOT_INJECTED_MESSAGE } from '../lock-service-not-injected-message.const';
import { resolveResources } from '../resolve-resources';
import { RESOURCE_SEPARATOR } from '../resource-separator.const';

import type { PreDecoratorFunction } from '../../../pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';



type LockModeType = 'sequential' | 'exclusive';

const requireObservable = (result: unknown, methodName: string): Observable<unknown> => {
    if (!isObservable(result)) {
        throw new Error(`Method ${methodName} does not return an observable`);
    }
    
return result;
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
             
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            Inject(serviceToken)(target, serviceSymbol);

            const methodName = `${target.constructor.name}::${String(propertyKey)}`;
            const originalMethod = descriptor.value as unknown as (this: unknown, ...args: TArgs) => unknown;
            const effectiveDuration = duration ?? defaultDuration;

            descriptor.value = function observableLockDecorator(this: unknown, ...args: TArgs): TResult {
                return defer(() => {
                    const lockService = (this as Record<symbol, unknown>)[serviceSymbol] as
                        | LockServiceInterface
                        | undefined;
                    if (!isDefined(lockService)) {
                        throw new Error(LOCK_SERVICE_NOT_INJECTED_MESSAGE);
                    }
                    const resources = resolveResources(preLock, args);
                    const joinedKey = resources.join(RESOURCE_SEPARATOR);
                    const store = createLockServiceStore(lockService, effectiveDuration);

                    return runWithLock$(store, joinedKey, mode, {}, () =>
                        requireObservable(originalMethod.apply(this, args), methodName)
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
