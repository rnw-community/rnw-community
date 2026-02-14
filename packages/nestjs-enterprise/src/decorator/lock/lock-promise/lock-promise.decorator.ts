import { executeLockPromise } from '../util/execute-lock-promise.util';
import { getMethodName } from '../util/get-method-name.util';
import { getRedlockService } from '../util/get-redlock-service.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

/**
 * @deprecated Use `createPromiseLockDecorators` instead. This decorator requires class inheritance from `LockableService`.
 * @see {@link createPromiseLockDecorators} for the DI-based approach.
 */
export const LockPromise =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            duration: number,
            catchErrorFn?: (error: unknown) => TResult,
            retryCount?: number
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            descriptor.value = executeLockPromise(
                getRedlockService, preLock, duration, retryCount,
                descriptor.value as K,
                getMethodName(target, propertyKey),
                catchErrorFn
            ) as K;

            return descriptor;
        };
