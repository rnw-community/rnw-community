import { type Observable, catchError, isObservable, tap, throwError } from 'rxjs';

import { isError, isNotEmptyString, isPromise, isString } from '@rnw-community/shared';

import type { CreateLogOptionsInterface } from '../../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../../type/error-log-input.type';
import type { PostLogInputType } from '../../type/post-log-input.type';
import type { PreLogInputType } from '../../type/pre-log-input.type';
import type { InterceptorMiddleware } from '@rnw-community/decorators-core';

const toErrorOrVoid = (error: unknown): Error | undefined => (isError(error) ? error : void 0);

 
export const createLogMiddleware = <TArgs extends readonly unknown[], TResult>(
    options: CreateLogOptionsInterface,
    preLog?: PreLogInputType<TArgs>,
    postLog?: PostLogInputType<TArgs, TResult>,
    errorLog?: ErrorLogInputType<TArgs>
): InterceptorMiddleware<TArgs, TResult> => {
    const { transport } = options;

    // eslint-disable-next-line max-statements -- single cohesive observe path: preLog + invoke + shape-aware postLog/errorLog
    return (context, next) => {
        const start = performance.now();
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
            const durationMs = performance.now() - start;
            const message = isString(postLog) ? postLog : postLog(result, durationMs, ...context.args);
            if (isNotEmptyString(message)) {
                transport.debug(message, context.logContext);
            }
        };
        const emitError = (error: unknown): void => {
            if (errorLog === void 0) {
                return;
            }
            const durationMs = performance.now() - start;
            const message = isString(errorLog) ? errorLog : errorLog(error, durationMs, ...context.args);
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
};
