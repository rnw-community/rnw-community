import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { createInterceptor } from '@rnw-community/decorators-core';
import { isError, isNotEmptyString, isPromise, isString } from '@rnw-community/shared';

import type { CreateLogOptionsInterface } from '../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../type/error-log-input.type';
import type { GetResultType } from '../type/get-result.type';
import type { PostLogInputType } from '../type/post-log-input.type';
import type { PreLogInputType } from '../type/pre-log-input.type';
import type { InterceptorMiddleware } from '@rnw-community/decorators-core';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

const toErrorOrVoid = (error: unknown): Error | undefined => (isError(error) ? error : void 0);

const buildLogMiddleware = <TArgs extends readonly unknown[], TResult>(
    options: CreateLogOptionsInterface,
    preLog?: PreLogInputType<TArgs>,
    postLog?: PostLogInputType<TArgs, TResult>,
    errorLog?: ErrorLogInputType<TArgs>
): InterceptorMiddleware<TArgs, TResult> => {
    const { transport } = options;

    // eslint-disable-next-line max-statements -- single cohesive observe path: preLog + invoke + shape-aware postLog/errorLog
    const middleware: InterceptorMiddleware<TArgs, TResult> = (context, next) => {
        if (preLog !== void 0) {
            const message = isString(preLog) ? preLog : preLog(...context.args);
            if (isNotEmptyString(message)) {
                transport.log(message, context.logContext);
            }
        }

        const emitSuccess = (result: TResult): void => {
            if (postLog === void 0) {
                return;
            }
            const message = isString(postLog) ? postLog : postLog(result, ...context.args);
            if (isNotEmptyString(message)) {
                transport.debug(message, context.logContext);
            }
        };
        const emitError = (error: unknown): void => {
            if (errorLog === void 0) {
                return;
            }
            const message = isString(errorLog) ? errorLog : errorLog(error, ...context.args);
            if (isNotEmptyString(message)) {
                transport.error(message, toErrorOrVoid(error), context.logContext);
            }
        };

        let raw: TResult;
        try {
            raw = next();
        } catch (err) {
            emitError(err);
            throw err;
        }

        if (isPromise(raw)) {
            return Promise.resolve(raw).then(
                (resolved) => {
                    emitSuccess(resolved as TResult);

                    return resolved;
                },
                (err: unknown) => {
                    emitError(err);
                    throw err;
                }
            ) as TResult;
        }
        if (isObservable(raw)) {
            return (raw as unknown as Observable<unknown>).pipe(
                tap((value: unknown) => void emitSuccess(value as TResult)),
                catchError((err: unknown) => {
                    emitError(err);

                    return throwError(() => err);
                })
            ) as unknown as TResult;
        }
        emitSuccess(raw);

        return raw;
    };

    return middleware;
};

export const createLogDecorator =
    (options: CreateLogOptionsInterface) =>
    <K extends AnyFn, TResult extends GetResultType<ReturnType<K>>, TArgs extends Parameters<K>>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, TResult>({
            middleware: buildLogMiddleware<TArgs, TResult>(options, preLog, postLog, errorLog),
        }) as unknown as MethodDecoratorType<K>;
