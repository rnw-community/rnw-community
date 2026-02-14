import { executeLockObservable } from '../util/execute-lock-observable.util';
import { getMethodName } from '../util/get-method-name.util';
import { getRedlockService } from '../util/get-redlock-service.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

/**
 * @deprecated Use `createObservableLockDecorators` instead. This decorator requires class inheritance from `LockableService`.
 * @see {@link createObservableLockDecorators} for the DI-based approach.
 */
export const LockObservable =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            duration: number,
            catchErrorFn$?: (error: unknown) => TResult,
            retryCount?: number
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            descriptor.value = executeLockObservable(
                getRedlockService, preLock, duration, retryCount,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                descriptor.value!,
                getMethodName(target, propertyKey),
                catchErrorFn$
            ) as K;

            return descriptor;
        };
