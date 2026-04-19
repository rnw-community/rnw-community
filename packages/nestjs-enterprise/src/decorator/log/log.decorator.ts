import { Logger } from '@nestjs/common';
import type { Observable } from 'rxjs';

import { createLegacyLog } from '@rnw-community/log-decorator';
import type { LogTransportInterface } from '@rnw-community/log-decorator';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

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

const identity = <T>(value: T): T => value;

const baseLog = createLegacyLog({
    transport: nestLogTransport,
    strategies: [observableStrategy],
    sanitizer: identity,
});

const toArrayStylePreLog = <TArgs extends unknown[]>(
    preLog: PreDecoratorFunction<TArgs> | string
): string | ((args: TArgs) => string) =>
    typeof preLog === 'function' ? (args: TArgs): string => (preLog as (...spread: TArgs) => string)(...args) : preLog;

const toArrayStylePostLog = <TArgs extends unknown[], TResult>(
    postLog: PostLogFunction<TResult, TArgs> | string | undefined
): string | ((result: TResult, args: TArgs) => string) | undefined => {
    if (!isDefined(postLog) || typeof postLog === 'string') {
        return postLog;
    }
    return (result: TResult, args: TArgs): string =>
        (postLog as (result: TResult, ...spread: TArgs) => string)(result, ...args);
};

const toArrayStyleErrorLog = <TArgs extends unknown[]>(
    errorLog: ErrorLogFunction<TArgs> | string | undefined
): string | ((error: unknown, args: TArgs) => string) | undefined => {
    if (!isDefined(errorLog) || typeof errorLog === 'string') {
        return errorLog;
    }
    return (error: unknown, args: TArgs): string => (errorLog as (error: unknown, ...spread: TArgs) => string)(error, ...args);
};

export const Log =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLog: PreDecoratorFunction<TArgs> | string,
            postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
            errorLog?: ErrorLogFunction<TArgs> | string
        ): MethodDecoratorType<K> =>
        baseLog<TArgs, GetResultType<TResult>>(
            toArrayStylePreLog<TArgs>(preLog),
            toArrayStylePostLog<TArgs, GetResultType<TResult>>(postLog),
            toArrayStyleErrorLog<TArgs>(errorLog)
        ) as MethodDecoratorType<K>;
