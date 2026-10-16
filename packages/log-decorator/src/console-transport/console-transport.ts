/* eslint-disable no-console */
import type { LogTransportInterface } from '../interface/log-transport.interface';

/**
 * A ready-made `LogTransportInterface` that writes to `console.log`, `console.debug`, and `console.error` with a `[ClassName::methodName]` prefix.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/log-decorator/readme.md#consoletransport
 */
export const consoleTransport: LogTransportInterface = {
    log: (message: string, logContext: string): void => {
        console.log(`[${logContext}] ${message}`);
    },
    debug: (message: string, logContext: string): void => {
        console.debug(`[${logContext}] ${message}`);
    },
    error: (message: string, error: unknown, logContext: string): void => {
        console.error(`[${logContext}] ${message}`, error);
    },
};
