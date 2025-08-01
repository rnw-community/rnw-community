import { type Observable, catchError, concatMap, finalize, from, isObservable, map, of, tap } from 'rxjs';

import { isDefined } from '@rnw-community/shared';

import { runPreLock } from '../util/run-pre-lock.util';
import { validateRedlock } from '../util/validate-redlock.util';

import type { MethodDecoratorType } from '../../../type/method-decorator.type';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockableService } from '../service/lockable.service';

export const LockObservable =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <K extends (...args: any) => any, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLock: PreDecoratorFunction<TArgs, string[]> | string[],
            duration: number,
            catchErrorFn$?: (error: unknown) => TResult
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = descriptor.value!;

            // eslint-disable-next-line max-statements,func-names
            descriptor.value = function (this: LockableService, ...args: TArgs): TResult {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return of(true).pipe(
                    // eslint-disable-next-line no-invalid-this
                    tap(() => void validateRedlock(this)),
                    map(() => runPreLock(preLock, ...args)),
                    concatMap(lockKeys =>
                        // eslint-disable-next-line no-invalid-this
                        from(this.redlock.acquire(lockKeys, duration)).pipe(
                            concatMap(currentLock => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion,no-invalid-this
                                const result = originalMethod.apply(this, args) as Observable<TResult>;

                                if (!isObservable(result)) {
                                    void currentLock.release().catch(() => void 0);

                                    throw new Error(
                                        `Method ${target.constructor.name}::${String(propertyKey)} does not return an observable`
                                    );
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
                        )
                    )
                ) as TResult;
            } as K;

            return descriptor;
        };
