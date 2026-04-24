import type { LogTransportInterface } from './log-transport.interface';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
}
