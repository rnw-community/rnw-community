import { defaultSanitizer } from './default-sanitizer';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import type { ErrorLogInputType } from './error-log-input.type';
import type { PostLogInputType } from './post-log-input.type';
import type { PreLogInputType } from './pre-log-input.type';
import type { ExecutionContextInterface, InterceptorInterface } from '@rnw-community/decorators-core';

type TransportType = CreateLogOptionsInterface['transport'];
type AnyContext = ExecutionContextInterface;

const toErrorOrVoid = (error: unknown): Error | undefined =>
    error instanceof Error ? error : void 0;

interface DurationLogOptions {
    readonly context: AnyContext;
    readonly measureDuration: boolean;
}

const logOnEnterWithDuration = (transport: TransportType, opts: DurationLogOptions): void => {
    if (opts.measureDuration) {
        transport.log(`${opts.context.methodName}:begin`, opts.context.logContext);
    }
};

interface SuccessDurationLogOptions extends DurationLogOptions {
    readonly durationMs: number;
}

const logOnSuccessWithDuration = (transport: TransportType, opts: SuccessDurationLogOptions): void => {
    if (opts.measureDuration) {
        transport.debug(`${opts.context.methodName}:done (${opts.durationMs.toFixed(2)}ms)`, opts.context.logContext);
    }
};

interface ErrorDurationLogOptions extends SuccessDurationLogOptions {
    readonly error: unknown;
}

const logOnErrorWithDuration = (transport: TransportType, opts: ErrorDurationLogOptions): void => {
    if (opts.measureDuration) {
        transport.error(`${opts.context.methodName}:throw (${opts.durationMs.toFixed(2)}ms)`, opts.error, opts.context.logContext);
    }
};

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

            if (preLog === void 0) {
                logOnEnterWithDuration(transport, { context, measureDuration });

                return;
            }

            if (typeof preLog === 'string') {
                transport.log(preLog, logContext);
            } else {
                transport.log(preLog(sanitizeArgs(args)), logContext);
            }
        },

        onSuccess: (context: ExecutionContextInterface<TArgs>, result: TResult, durationMs: number): void => {
            const { logContext, args } = context;

            if (postLog === void 0) {
                logOnSuccessWithDuration(transport, { context, durationMs, measureDuration });

                return;
            }

            if (typeof postLog === 'string') {
                transport.debug(postLog, logContext);
            } else {
                transport.debug(postLog(result, sanitizeArgs(args)), logContext);
            }
        },

        onError: (context: ExecutionContextInterface<TArgs>, error: unknown, durationMs: number): void => {
            const { logContext, args } = context;

            if (errorLog === void 0) {
                logOnErrorWithDuration(transport, { context, error, durationMs, measureDuration });

                return;
            }

            if (typeof errorLog === 'string') {
                transport.error(errorLog, toErrorOrVoid(error), logContext);
            } else {
                transport.error(errorLog(error, sanitizeArgs(args)), toErrorOrVoid(error), logContext);
            }
        },
    };
};
