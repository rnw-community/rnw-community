import { executeLockObservable } from '../util/execute-lock-observable.util';
import { getMethodName } from '../util/get-method-name.util';
import { getRedlockService } from '../util/get-redlock-service.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { MethodDecoratorType } from '@rnw-community/shared';
import type { Observable } from 'rxjs';

/**
 * Deprecated Redlock-based lock decorator for `Observable` methods of `LockableService` subclasses; use `createObservableLockDecorators` instead.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/src/decorator/lock/lock-observable/lock-observable-decorator.md
 */
export const LockObservable =
    <
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        K extends (...args: readonly any[]) => Observable<unknown>,
        TArgs extends Parameters<K>,
    >(
        preLock: PreDecoratorFunction<TArgs, string[]> | string[],
        duration: number,
        catchErrorFn$?: (error: unknown) => ReturnType<K>,
        retryCount?: number
    ): MethodDecoratorType<K> =>
    (target, propertyKey, descriptor) => {
        descriptor.value = executeLockObservable(
            getRedlockService,
            preLock,
            duration,
            retryCount,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            descriptor.value!,
            getMethodName(target, propertyKey),
            catchErrorFn$
        ) as unknown as K;

        return descriptor;
    };
