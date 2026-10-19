import { Logger } from '@nestjs/common';

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

/**
 * Method decorator logging the start, result, and failure of sync, `Promise`, and `Observable` methods through the NestJS `Logger`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/src/decorator/log/log-decorator.md
 */
export const Log = createLogDecorator({ transport: nestLogTransport });
