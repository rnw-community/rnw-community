import { Logger } from '@nestjs/common';

import { observableStrategy } from '@rnw-community/decorators-core';
import {
    type CreateLogOptionsInterface,
    type ErrorLogInputType,
    type LogTransportInterface,
    type PostLogInputType,
    type PreLogInputType,
    createLog,
} from '@rnw-community/log-decorator';
import { type AnyFn, isError } from '@rnw-community/shared';

import type { MethodDecoratorType } from '@rnw-community/decorators-core';
import type { Observable } from 'rxjs';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

const nestLogTransport: LogTransportInterface = {
    log: (message, logContext) => void Logger.log(message, logContext),
    debug: (message, logContext) => void Logger.debug(message, logContext),
    error: (message, error, logContext) => {
        if (isError(error)) {
            Logger.error(message, { err: error }, logContext);
        } else {
            Logger.error(message, logContext);
        }
    },
};

const options: CreateLogOptionsInterface = {
    transport: nestLogTransport,
    strategies: [observableStrategy],
};

const baseLog = createLog(options);

export const Log =
    <K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
        preLog: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, GetResultType<TResult>>,
        errorLog?: ErrorLogInputType<TArgs>
    ): MethodDecoratorType =>
        baseLog<TArgs, GetResultType<TResult>>(preLog, postLog, errorLog);
