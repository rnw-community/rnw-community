import { isPromise } from '../util/is-promise.util';
import { runPreLock } from '../util/run-pre-lock.util';
import { validateRedlock } from '../util/validate-redlock.util';

import type { MethodDecoratorType } from '../../../type/method-decorator.type';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockableService } from '../service/lockable.service';

export const LockPromise =
    <TResult, TArgs extends unknown[] = unknown[]>(
        preLock: PreDecoratorFunction<TArgs, string[]> | string[],
        duration: number
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalMethod = descriptor.value!;

        // @ts-expect-error TODO: Provide proper types
        // eslint-disable-next-line func-names
        descriptor.value = function (this: LockableService, ...args: TArgs) {
            let lockKeys: string[] = [];
            try {
                validateRedlock(this);
                lockKeys = runPreLock(preLock, ...args);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                return Promise.reject(error);
            }

            return this.redlock.acquire(lockKeys, duration).then(currentLock => {
                try {
                    const originalResult = originalMethod.apply(this, args);
                    if (!isPromise(originalResult)) {
                        throw new Error(
                            `Method ${target.constructor.name}::${String(propertyKey)} does not return a promise`
                        );
                    }

                    return originalResult;
                    // eslint-disable-next-line promise/always-return
                } finally {
                    void currentLock.release();
                }
            }) as TResult;
        };

        return descriptor;
    };
