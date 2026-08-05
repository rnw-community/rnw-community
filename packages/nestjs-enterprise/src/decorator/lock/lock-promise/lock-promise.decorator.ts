import { executeLockPromise } from '../util/execute-lock-promise.util.js';
import { getMethodName } from '../util/get-method-name.util.js';
import { getRedlockService } from '../util/get-redlock-service.util.js';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type.js';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

/**
 * @deprecated Use `createPromiseLockDecorators` instead. This decorator requires class inheritance from `LockableService`.
 * @see {@link createPromiseLockDecorators} for the DI-based approach.
 */
export const LockPromise =
    <K extends AnyFn, TArgs extends Parameters<K>>(
        preLock: PreDecoratorFunction<TArgs, string[]> | string[],
        duration: number,
        catchErrorFn?: (error: unknown) => ReturnType<K>,
        retryCount?: number
    ): MethodDecoratorType<K> =>
    (target, propertyKey, descriptor) => {
        descriptor.value = executeLockPromise(
            getRedlockService,
            preLock,
            duration,
            retryCount,
            descriptor.value as K,
            getMethodName(target, propertyKey),
            catchErrorFn
        ) as unknown as K;

        return descriptor;
    };
