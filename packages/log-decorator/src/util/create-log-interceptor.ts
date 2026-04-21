import { isError, isNotEmptyString, isString } from '@rnw-community/shared';

import type { CreateLogOptionsInterface } from '../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../type/error-log-input.type';
import type { PostLogInputType } from '../type/post-log-input.type';
import type { PreLogInputType } from '../type/pre-log-input.type';
import type { ExecutionContextInterface, InterceptorInterface } from '@rnw-community/decorators-core';

const toErrorOrVoid = (error: unknown): Error | undefined => (isError(error) ? error : void 0);

export const createLogInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateLogOptionsInterface,
    preLog?: PreLogInputType<TArgs>,
    postLog?: PostLogInputType<TArgs, TResult>,
    errorLog?: ErrorLogInputType<TArgs>
): InterceptorInterface<TArgs, TResult> => {
    const { transport } = options;

    return {
        onEnter: (context: ExecutionContextInterface<TArgs>): void => {
            if (preLog === void 0) {
                return;
            }
            const message = isString(preLog) ? preLog : preLog(...context.args);
            if (isNotEmptyString(message)) {
                transport.log(message, context.logContext);
            }
        },

        onSuccess: (context: ExecutionContextInterface<TArgs>, result: TResult, durationMs: number): void => {
            if (postLog === void 0) {
                return;
            }
            const message = isString(postLog) ? postLog : postLog(result, durationMs, ...context.args);
            if (isNotEmptyString(message)) {
                transport.debug(message, context.logContext);
            }
        },

        onError: (context: ExecutionContextInterface<TArgs>, error: unknown, durationMs: number): void => {
            if (errorLog === void 0) {
                return;
            }
            const message = isString(errorLog) ? errorLog : errorLog(error, durationMs, ...context.args);
            if (isNotEmptyString(message)) {
                transport.error(message, toErrorOrVoid(error), context.logContext);
            }
        },
    };
};
