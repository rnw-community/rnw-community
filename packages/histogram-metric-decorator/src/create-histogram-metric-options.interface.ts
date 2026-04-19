import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

import type { HistogramTransportInterface } from './histogram-transport.interface';

export interface CreateHistogramMetricOptionsInterface {
    /** Transport that receives observation events. Consumers supply their own implementation. */
    readonly transport: HistogramTransportInterface;

    /**
     * Additional result strategies passed to the underlying interceptor engine.
     * The engine already handles plain Promises natively; add strategies here only
     * when you need RxJS Observable support or similar custom async primitives.
     */
    readonly strategies?: readonly ResultStrategyInterface[];
}
