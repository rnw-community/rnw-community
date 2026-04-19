import type { LogTransportInterface } from './log-transport.interface';
import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

export interface CreateLogOptionsInterface {
    readonly transport: LogTransportInterface;
    readonly strategies?: readonly ResultStrategyInterface[];
}
