import { Logger } from '@nestjs/common';
import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreLogFunction } from './type/pre-log-function.type';
import type { MethodDecoratorType } from '../../type/method-decorator.type';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

export const Log =
    <TResult, TArgs extends unknown[] = unknown[]>(
        preLog: PreLogFunction<TArgs> | string,
        postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
        errorLog?: ErrorLogFunction<TArgs> | string
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        const logContext = `${target.constructor.name}::${String(propertyKey)}`;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalMethod = descriptor.value!;

        // eslint-disable-next-line max-statements,func-names
        descriptor.value = function (...args: TArgs) {
            type R = GetResultType<TResult>;

            const runPreLog = (): void => {
                if (isNotEmptyString(preLog)) {
                    Logger.log(preLog, logContext);
                } else if (isDefined(preLog)) {
                    Logger.log(preLog(args[0], args[1], args[2], args[3], args[4]), logContext);
                }
            };

            const runPostLog = (res: R): R => {
                if (isNotEmptyString(postLog)) {
                    Logger.debug(postLog, logContext);
                } else if (isDefined(postLog)) {
                    Logger.debug(postLog(res, args[0], args[1], args[2], args[3], args[4]), logContext);
                }

                return res;
            };

            const runErrorLog = (error: unknown): void => {
                if (isNotEmptyString(errorLog)) {
                    Logger.error(errorLog, logContext);
                } else if (isDefined(errorLog)) {
                    Logger.error(errorLog(error, args[0], args[1], args[2], args[3], args[4]), logContext);
                }
            };

            try {
                runPreLog();

                const result = originalMethod.apply(this, args);

                if (isDefined(postLog)) {
                    if (isObservable(result)) {
                        return (result as Observable<R>).pipe(
                            tap(runPostLog),
                            catchError((error: unknown) => {
                                runErrorLog(error);

                                return throwError(() => error);
                            })
                        ) as unknown as TResult;
                    } else if (result instanceof Promise) {
                        return result.then(runPostLog).catch((error: unknown) => {
                            runErrorLog(error);

                            throw error;
                        }) as unknown as TResult;
                    }

                    runPostLog(result as R);
                }

                return result;
            } catch (error) {
                runErrorLog(error);

                throw error;
            }
        };

        return descriptor;
    };
