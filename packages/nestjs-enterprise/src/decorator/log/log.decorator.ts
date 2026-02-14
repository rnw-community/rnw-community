import { Logger } from '@nestjs/common';
import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { type AnyFn, isDefined, isNotEmptyString, isPromise } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { MethodDecoratorType } from '../../type/method-decorator.type';
import type { PreDecoratorFunction } from '../../type/pre-decorator-function.type';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

export const Log =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLog: PreDecoratorFunction<TArgs> | string,
            postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
            errorLog?: ErrorLogFunction<TArgs> | string
        ): MethodDecoratorType<K> =>
        (target, propertyKey, descriptor) => {
            const logContext = `${target.constructor.name}::${String(propertyKey)}`;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = descriptor.value!;

            // eslint-disable-next-line max-statements,func-names
            descriptor.value = function (...args: TArgs): TResult {
                type R = GetResultType<TResult>;

                const runPreLog = (): void => {
                    if (isNotEmptyString(preLog)) {
                        Logger.log(preLog, logContext);
                    } else if (isDefined(preLog)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        Logger.log(preLog(args[0], args[1], args[2], args[3], args[4]), logContext);
                    }
                };

                const runPostLog = (res: R): R => {
                    if (isNotEmptyString(postLog)) {
                        Logger.debug(postLog, logContext);
                    } else if (isDefined(postLog)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        Logger.debug(postLog(res, args[0], args[1], args[2], args[3], args[4]), logContext);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return res;
                };

                const runErrorLog = (error: unknown): void => {
                    if (isNotEmptyString(errorLog)) {
                        Logger.error(errorLog, logContext);
                    } else if (isDefined(errorLog)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        Logger.error(errorLog(error, args[0], args[1], args[2], args[3], args[4]), logContext);
                    }
                };

                try {
                    runPreLog();

                    // @ts-expect-error We need this to handle generic methods correctly
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const result = originalMethod.apply(this, args);

                    if (isDefined(postLog)) {
                        if (isObservable(result)) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                            return (result as Observable<R>).pipe(
                                tap(runPostLog),
                                catchError((error: unknown) => {
                                    runErrorLog(error);

                                    return throwError(() => error);
                                })
                            ) as unknown as TResult;
                        } else if (isPromise<R>(result)) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                            return result.then(runPostLog).catch((error: unknown) => {
                                runErrorLog(error);

                                throw error;
                            }) as unknown as TResult;
                        }

                        runPostLog(result as R);
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return result;
                } catch (error) {
                    runErrorLog(error);

                    throw error;
                }
            } as K;

            return descriptor;
        };
