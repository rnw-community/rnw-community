import { Logger } from '@nestjs/common';
import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { type AnyFn, type MethodDecoratorType, isDefined, isNotEmptyString, isPromise } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreDecoratorFunction } from '../../type/pre-decorator-function.type';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

type DecoratorMethodType = (...args: unknown[]) => unknown;
type DecoratorDescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

interface LogFn {
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
        preLog: PreDecoratorFunction<TArgs> | string,
        postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
        errorLog?: ErrorLogFunction<TArgs> | string
    ): MethodDecoratorType<K>;

    (
        preLog: PreDecoratorFunction<unknown[]> | string,
        postLog?: PostLogFunction<unknown, unknown[]> | string,
        errorLog?: ErrorLogFunction<unknown[]> | string
    ): MethodDecorator;
}

export const Log: LogFn =
    (
            preLog: PreDecoratorFunction<unknown[]> | string,
            postLog?: PostLogFunction<unknown, unknown[]> | string,
            errorLog?: ErrorLogFunction<unknown[]> | string
        ): MethodDecorator =>
        (target, propertyKey, descriptor) => {
            const logContext = `${target.constructor.name}::${String(propertyKey)}`;
            const typedDescriptor = descriptor as unknown as DecoratorDescriptorType;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const originalMethod = typedDescriptor.value!;

            // eslint-disable-next-line max-statements,func-names
            typedDescriptor.value = function (...args: unknown[]): unknown {
                const runPreLog = (): void => {
                    if (isNotEmptyString(preLog)) {
                        Logger.log(preLog, logContext);
                    } else if (isDefined(preLog)) {
                        Logger.log(preLog(...args), logContext);
                    }
                };

                const runPostLog = (res: unknown): unknown => {
                    if (isNotEmptyString(postLog)) {
                        Logger.debug(postLog, logContext);
                    } else if (isDefined(postLog)) {
                        Logger.debug(postLog(res, ...args), logContext);
                    }

                    return res;
                };

                const runErrorLog = (error: unknown): void => {
                    // eslint-disable-next-line no-undefined
                    const stack = error instanceof Error ? error.stack : undefined;

                    if (isNotEmptyString(errorLog)) {
                        Logger.error(errorLog, stack, logContext);
                    } else if (isDefined(errorLog)) {
                        Logger.error(errorLog(error, ...args), stack, logContext);
                    }
                };

                try {
                    runPreLog();

                    const result = originalMethod.call(this, ...args);

                    if (isDefined(postLog)) {
                        if (isObservable(result)) {
                            return result.pipe(
                                tap(runPostLog),
                                catchError((error: unknown) => {
                                    runErrorLog(error);

                                    return throwError(() => error);
                                })
                            );
                        } else if (isPromise(result)) {
                            return result.then(runPostLog).catch((error: unknown) => {
                                runErrorLog(error);

                                throw error;
                            });
                        }

                        runPostLog(result);
                    }

                    return result;
                } catch (error) {
                    runErrorLog(error);

                    throw error;
                }
            };

            return descriptor;
        };
