import { type Observable, concatMap, from, isObservable, map, of, tap } from 'rxjs';

import { runPreLock } from '../util/run-pre-lock.util';
import { validateRedlock } from '../util/validate-redlock.util';

import type { MethodDecoratorType } from '../../../type/method-decorator.type';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';
import type { LockableService } from '../service/lockable.service';

export const LockObservable =
    <TResult, TArgs extends unknown[] = unknown[]>(
        preLock: PreDecoratorFunction<TArgs, string[]> | string[],
        duration: number
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalMethod = descriptor.value!;

        // eslint-disable-next-line max-statements,func-names
        descriptor.value = function (this: LockableService, ...args: TArgs) {
            return of(true).pipe(
                tap(() => void validateRedlock(this)),
                map(() => runPreLock(preLock, ...args)),
                concatMap(lockKeys => from(this.redlock.acquire(lockKeys, duration))),
                concatMap(currentLock => {
                    try {
                        const result = originalMethod.apply(this, args) as Observable<TResult>;

                        if (!isObservable(result)) {
                            throw new Error(
                                `Method ${target.constructor.name}::${String(propertyKey)} does not return an observable`
                            );
                        }

                        return result;
                    } finally {
                        // HINT: Finalize does not work in this case, rxjs bug?
                        void currentLock.release();
                    }
                })
            ) as TResult;
        };

        return descriptor;
    };
