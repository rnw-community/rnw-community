import { Logger } from '@nestjs/common';

import { observableStrategy } from '@rnw-community/decorators-core';
import { type LogTransportInterface, createLogDecorator } from '@rnw-community/log-decorator';
import { isError } from '@rnw-community/shared';

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

export const Log = createLogDecorator({ transport: nestLogTransport, strategies: [observableStrategy] });
