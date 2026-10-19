import { executeLockPromise } from '../util/execute-lock-promise.util';
import { getMethodName } from '../util/get-method-name.util';
import { getRedlockService } from '../util/get-redlock-service.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

/**
 * Deprecated Redlock-based lock decorator for `Promise` methods of `LockableService` subclasses; use `createPromiseLockDecorators` instead.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/src/decorator/lock/lock-promise/lock-promise-decorator.md
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
