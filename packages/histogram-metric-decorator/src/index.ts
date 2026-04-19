export type { HistogramTransportInterface } from './interface/histogram-transport.interface';
export type { HistogramOptionsInterface } from './interface/histogram-options.interface';
export type { CreateHistogramMetricOptionsInterface } from './interface/create-histogram-metric-options.interface';

export type { InMemoryObservationInterface } from './transport/in-memory-observation.interface';
export type { InMemoryHistogramTransportInterface } from './transport/in-memory-histogram-transport.interface';
export { inMemoryHistogramTransport } from './transport/in-memory-histogram-transport';

export { createHistogramMetric } from './factory/create-histogram-metric';
export { createLegacyHistogramMetric } from './factory/create-legacy-histogram-metric';
