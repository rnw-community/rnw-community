import { type AnyFn, isDefined, isPromise } from '@rnw-community/shared';

import { runPreLock } from '../util/run-pre-lock.util';
import { validateRedlock } from '../util/validate-redlock.util';

import type { MethodDecoratorType } from '../../../type/method-decorator.type';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockableService } from '../service/lockable.service';

export const LockPromise =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            duration: number,
            catchErrorFn?: (error: unknown) => TResult
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value as K;

            // eslint-disable-next-line func-names
            descriptor.value = async function (this: LockableService, ...args: TArgs): Promise<unknown> {
                validateRedlock(this);

                const lockKeys = runPreLock(preLock, ...args);

                try {
                    const currentLock = await this.redlock.acquire(lockKeys, duration);

                    const originalResult: unknown = originalMethod.apply(this, args);
                    if (!isPromise(originalResult)) {
                        // HINT: https://github.com/mike-marcacci/node-redlock/issues/168
                        void currentLock.release().catch(() => void 0);

                        throw new Error(
                            `Method ${target.constructor.name}::${String(propertyKey)} does not return a promise`
                        );
                    }

                    return await originalResult.finally(() => {
                        // HINT: https://github.com/mike-marcacci/node-redlock/issues/168
                        void currentLock.release().catch(() => void 0);
                    });
                } catch (err: unknown) {
                    if (isDefined(catchErrorFn)) {
                        return catchErrorFn(err);
                    }

                    throw err;
                }
            } as K;

            return descriptor;
        };
