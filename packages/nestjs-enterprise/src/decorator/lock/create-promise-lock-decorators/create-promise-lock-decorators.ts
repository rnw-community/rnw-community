import { executeLockPromise } from '../util/execute-lock-promise.util';
import { getLockService } from '../util/get-lock-service.util';
import { getMethodName } from '../util/get-method-name.util';
import { injectLockService } from '../util/inject-lock-service.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { AbstractConstructor, AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createPromiseLockDecorators = (serviceToken: AbstractConstructor<LockServiceInterface>, defaultDuration: number) => {
    const serviceSymbol = Symbol('LockService');
    const getService = (instance: unknown): LockServiceInterface =>
        getLockService(instance as Record<symbol, unknown>, serviceSymbol);

    const createDecorator =
        (retryCount: number | undefined) =>
            <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
                    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
                    catchErrorFn?: (error: unknown) => TResult,
                    duration?: number
                ): MethodDecoratorType<K> =>
                (target, propertyKey, descriptor) => {
                    injectLockService(target, serviceToken, serviceSymbol);

                    descriptor.value = executeLockPromise(
                        getService, preLock, duration ?? defaultDuration, retryCount,
                        descriptor.value as K,
                        getMethodName(target, propertyKey),
                        catchErrorFn
                    ) as K;

                    return descriptor;
                };

    // eslint-disable-next-line no-undefined
    return { SequentialLock: createDecorator(undefined), ExclusiveLock: createDecorator(0) };
};
