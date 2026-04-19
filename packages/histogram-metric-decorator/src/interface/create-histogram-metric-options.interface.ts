import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

import type { HistogramTransportInterface } from './histogram-transport.interface';

export interface CreateHistogramMetricOptionsInterface {
    readonly transport: HistogramTransportInterface;
    readonly strategies?: readonly ResultStrategyInterface[];
}
