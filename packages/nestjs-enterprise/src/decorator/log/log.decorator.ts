import { Logger } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { createLegacyLog } from '@rnw-community/log-decorator';
import type { LogTransportInterface } from '@rnw-community/log-decorator';
import { observableStrategy } from '@rnw-community/decorators-rxjs';

import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreDecoratorFunction } from '../../type/pre-decorator-function.type';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

const nestLogTransport: LogTransportInterface = {
    log: (message, logContext) => Logger.log(message, logContext),
    debug: (message, logContext) => Logger.debug(message, logContext),
    error: (message, error, logContext) => {
        if (error instanceof Error) {
            Logger.error(message, { err: error }, logContext);
        } else {
            Logger.error(message, logContext);
        }
    },
};

const baseLog = createLegacyLog({
    transport: nestLogTransport,
    strategies: [observableStrategy],
    // Preserve upstream behavior: args are passed verbatim to user-supplied
    // pre/post/error functions — no truncation or PII-style transformation.
    sanitizer: (value: unknown): unknown => value,
});

export const Log =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLog: PreDecoratorFunction<TArgs> | string,
            postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
            errorLog?: ErrorLogFunction<TArgs> | string
        ): MethodDecoratorType<K> => {
        const adaptedPre =
            typeof preLog === 'function'
                ? (args: TArgs): string => (preLog as (...spread: TArgs) => string)(...args)
                : preLog;

        const adaptedPost =
            typeof postLog === 'function'
                ? (result: GetResultType<TResult>, args: TArgs): string =>
                    (postLog as (result: GetResultType<TResult>, ...spread: TArgs) => string)(result, ...args)
                : postLog;

        const adaptedError =
            typeof errorLog === 'function'
                ? (error: unknown, args: TArgs): string =>
                    (errorLog as (error: unknown, ...spread: TArgs) => string)(error, ...args)
                : errorLog;

        return baseLog<TArgs, GetResultType<TResult>>(adaptedPre, adaptedPost, adaptedError) as MethodDecoratorType<K>;
    };
