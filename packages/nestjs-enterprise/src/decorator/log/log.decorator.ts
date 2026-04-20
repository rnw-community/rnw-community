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
import { type AnyFn, type MethodDecoratorType, isError } from '@rnw-community/shared';

import type { GetResultType } from '@rnw-community/decorators-core';

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

const boundLog = createLog({ transport: nestLogTransport, strategies: [observableStrategy] } satisfies CreateLogOptionsInterface);

export const Log = <K extends AnyFn, TResult extends GetResultType<ReturnType<K>>, TArgs extends Parameters<K>>(
    preLog?: PreLogInputType<TArgs>,
    postLog?: PostLogInputType<TArgs, TResult>,
    errorLog?: ErrorLogInputType<TArgs>
): MethodDecoratorType<K> => boundLog<K, TResult, TArgs>(preLog, postLog, errorLog);
