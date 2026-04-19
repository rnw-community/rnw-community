import { EMPTY, type Observable, catchError, concatMap, defer, finalize, from, isObservable, tap } from 'rxjs';

import { isDefined } from '@rnw-community/shared';

import { runPreLock } from './run-pre-lock.util';

import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockServiceInterface } from '../interface/lock-service.interface';

export const executeLockObservable = <TResult, TArgs extends unknown[] = unknown[]>(
    getLockServiceFn: (instance: unknown) => LockServiceInterface,
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    duration: number,
    retryCount: number | undefined,
    originalMethod: (...fnArgs: TArgs) => unknown,
    methodName: string,
    catchErrorFn$?: (error: unknown) => TResult
    // eslint-disable-next-line @typescript-eslint/max-params, func-names
) => function (this: unknown, ...args: TArgs): TResult {
    return defer(() => {
        const lockService = getLockServiceFn(this);
        const lockKeys = runPreLock(preLock, ...args);

        const acquireFn =
            retryCount === 0
                ? () => lockService.tryAcquire(lockKeys, duration)
                : () => lockService.acquire(lockKeys, duration);

        return from(acquireFn()).pipe(
            concatMap(currentLock => {
                if (!isDefined(currentLock)) {
                    if (isDefined(catchErrorFn$)) {
                        throw new Error(`Lock not acquired for keys: ${lockKeys.join(', ')}`);
                    }

                    return EMPTY;
                }

                const result = originalMethod.apply(this, args) as Observable<TResult>;

                if (!isObservable(result)) {
                    void currentLock.release().catch(() => void 0);

                    throw new Error(`Method ${methodName} does not return an observable`);
                }

                return result.pipe(
                    finalize(() => {
                        void currentLock.release().catch(() => void 0);
                    })
                );
            }),
            isDefined(catchErrorFn$)
                ? catchError((err: unknown) => catchErrorFn$(err) as Observable<TResult>)
                : tap()
        );
    }) as TResult;
};
