import { isDefined, isPromise } from '@rnw-community/shared';

import { runPreLock } from './run-pre-lock.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';

export const executeLockPromise = <TArgs extends unknown[] = unknown[]>(
    getLockServiceFn: (instance: unknown) => LockServiceInterface,
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    duration: number,
    retryCount: number | undefined,
    originalMethod: (...fnArgs: TArgs) => unknown,
    methodName: string,
    catchErrorFn?: (error: unknown) => unknown
    // eslint-disable-next-line @typescript-eslint/max-params, max-statements, func-names
) => async function (this: unknown, ...args: TArgs): Promise<unknown> {
    const lockService = getLockServiceFn(this);
    const lockKeys = runPreLock(preLock, ...args);

    try {
        const currentLock =
            retryCount === 0
                ? await lockService.tryAcquire(lockKeys, duration)
                : await lockService.acquire(lockKeys, duration);

        if (!isDefined(currentLock)) {
            if (isDefined(catchErrorFn)) {
                throw new Error(`Lock not acquired for keys: ${lockKeys.join(', ')}`);
            }

            // eslint-disable-next-line no-undefined
            return undefined;
        }

        const originalResult: unknown = originalMethod.apply(this, args);
        if (!isPromise(originalResult)) {
            // HINT: https://github.com/mike-marcacci/node-redlock/issues/168
            void currentLock.release().catch(() => void 0);

            throw new Error(`Method ${methodName} does not return a promise`);
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
};
