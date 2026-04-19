import type { HistogramTransportInterface } from './histogram-transport.interface';
import type { ResultStrategyInterface } from '@rnw-community/decorators-core';


export interface CreateHistogramMetricOptionsInterface {
    readonly transport: HistogramTransportInterface;
    readonly strategies?: readonly ResultStrategyInterface[];
}
