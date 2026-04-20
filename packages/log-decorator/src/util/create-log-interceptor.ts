import { isError, isString } from '@rnw-community/shared';

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

            const { logContext, args } = context;

            if (isString(preLog)) {
                transport.log(preLog, logContext);
            } else {
                transport.log(preLog(...args), logContext);
            }
        },

        onSuccess: (context: ExecutionContextInterface<TArgs>, result: TResult): void => {
            if (postLog === void 0) {
                return;
            }

            const { logContext, args } = context;

            if (isString(postLog)) {
                transport.debug(postLog, logContext);
            } else {
                transport.debug(postLog(result, ...args), logContext);
            }
        },

        onError: (context: ExecutionContextInterface<TArgs>, error: unknown): void => {
            if (errorLog === void 0) {
                return;
            }

            const { logContext, args } = context;

            if (isString(errorLog)) {
                transport.error(errorLog, toErrorOrVoid(error), logContext);
            } else {
                transport.error(errorLog(error, ...args), toErrorOrVoid(error), logContext);
            }
        },
    };
};
