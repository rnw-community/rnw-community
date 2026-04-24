/* eslint-disable no-console */
import type { LogTransportInterface } from '../interface/log-transport.interface';

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
