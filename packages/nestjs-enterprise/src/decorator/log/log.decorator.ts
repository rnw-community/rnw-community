import { Logger } from '@nestjs/common';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

import { createLegacyLog } from '@rnw-community/log-decorator';
import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreDecoratorFunction } from '../../type/pre-decorator-function.type';
import type { LogTransportInterface } from '@rnw-community/log-decorator';
import type { Observable } from 'rxjs';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

const nestLogTransport: LogTransportInterface = {
    log: (message, logContext) => void Logger.log(message, logContext),
    debug: (message, logContext) => void Logger.debug(message, logContext),
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
    sanitizer: <T>(value: T): T => value,
});

export const Log =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            preLog: PreDecoratorFunction<TArgs> | string,
            postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
            errorLog?: ErrorLogFunction<TArgs> | string
        ): MethodDecoratorType<K> =>
        baseLog<TArgs, GetResultType<TResult>>(
            typeof preLog === 'function' ? (args: TArgs): string => (preLog as (...spread: TArgs) => string)(...args) : preLog,
            !isDefined(postLog) || typeof postLog === 'string'
                ? postLog
                : (result: GetResultType<TResult>, args: TArgs): string =>
                      (postLog as (result: GetResultType<TResult>, ...spread: TArgs) => string)(result, ...args),
            !isDefined(errorLog) || typeof errorLog === 'string'
                ? errorLog
                : (error: unknown, args: TArgs): string =>
                      (errorLog as (error: unknown, ...spread: TArgs) => string)(error, ...args)
        ) as MethodDecoratorType<K>;
