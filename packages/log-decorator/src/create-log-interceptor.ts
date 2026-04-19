import type { ExecutionContextInterface, InterceptorInterface } from '@rnw-community/decorators-core';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import type { ErrorLogInputType, PostLogInputType, PreLogInputType } from './log-input.type';
import { defaultSanitizer } from './sanitizer';

export const createLogInterceptor = <TArgs extends readonly unknown[], TResult>(
    options: CreateLogOptionsInterface,
    preLog?: PreLogInputType<TArgs>,
    postLog?: PostLogInputType<TArgs, TResult>,
    errorLog?: ErrorLogInputType<TArgs>
): InterceptorInterface<TArgs, TResult> => {
    const { transport, sanitizer = defaultSanitizer, measureDuration = false } = options;

    const sanitizeArgs = (args: TArgs): TArgs => args.map((arg: unknown) => sanitizer(arg)) as unknown as TArgs;

    return {
        onEnter: (context: ExecutionContextInterface<TArgs>): void => {
            const { logContext, args } = context;

            if (preLog === undefined) {
                if (measureDuration) {
                    transport.log(`${context.methodName}:begin`, logContext);
                }
                return;
            }

            if (typeof preLog === 'string') {
                transport.log(preLog, logContext);
            } else {
                const sanitizedArgs = sanitizeArgs(args) as TArgs;
                transport.log(preLog(sanitizedArgs), logContext);
            }
        },

        onSuccess: (context: ExecutionContextInterface<TArgs>, result: TResult, durationMs: number): void => {
            const { logContext, args } = context;

            if (postLog === undefined) {
                if (measureDuration) {
                    transport.debug(`${context.methodName}:done (${durationMs.toFixed(2)}ms)`, logContext);
                }
                return;
            }

            if (typeof postLog === 'string') {
                transport.debug(postLog, logContext);
            } else {
                const sanitizedArgs = sanitizeArgs(args) as TArgs;
                transport.debug(postLog(result, sanitizedArgs), logContext);
            }
        },

        onError: (context: ExecutionContextInterface<TArgs>, error: unknown, durationMs: number): void => {
            const { logContext, args } = context;

            if (errorLog === undefined) {
                if (measureDuration) {
                    transport.error(`${context.methodName}:throw (${durationMs.toFixed(2)}ms)`, error, logContext);
                }
                return;
            }

            if (typeof errorLog === 'string') {
                transport.error(errorLog, error instanceof Error ? error : undefined, logContext);
            } else {
                const sanitizedArgs = sanitizeArgs(args) as TArgs;
                transport.error(errorLog(error, sanitizedArgs), error instanceof Error ? error : undefined, logContext);
            }
        },
    };
};
