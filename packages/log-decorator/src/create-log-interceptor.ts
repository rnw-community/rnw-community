import type { CreateLogOptionsInterface } from './create-log-options.interface';
import type { ErrorLogInputType } from './error-log-input.type';
import type { PostLogInputType } from './post-log-input.type';
import type { PreLogInputType } from './pre-log-input.type';
import type { ExecutionContextInterface, InterceptorInterface } from '@rnw-community/decorators-core';

const toErrorOrVoid = (error: unknown): Error | undefined =>
    error instanceof Error ? error : void 0;

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

            if (typeof preLog === 'string') {
                transport.log(preLog, logContext);
            } else {
                transport.log(preLog(...args), logContext);
            }
        },

        onSuccess: (context: ExecutionContextInterface<TArgs>, result: TResult, _durationMs: number): void => {
            if (postLog === void 0) {
                return;
            }

            const { logContext, args } = context;

            if (typeof postLog === 'string') {
                transport.debug(postLog, logContext);
            } else {
                transport.debug(postLog(result, ...args), logContext);
            }
        },

        onError: (context: ExecutionContextInterface<TArgs>, error: unknown, _durationMs: number): void => {
            if (errorLog === void 0) {
                return;
            }

            const { logContext, args } = context;

            if (typeof errorLog === 'string') {
                transport.error(errorLog, toErrorOrVoid(error), logContext);
            } else {
                transport.error(errorLog(error, ...args), toErrorOrVoid(error), logContext);
            }
        },
    };
};
