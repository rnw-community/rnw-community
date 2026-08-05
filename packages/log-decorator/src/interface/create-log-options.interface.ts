import type { LogTransportInterface } from './log-transport.interface.js';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
}
