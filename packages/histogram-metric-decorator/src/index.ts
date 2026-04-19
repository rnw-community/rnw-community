export type { HistogramTransportInterface } from './histogram-transport.interface';
export type { HistogramOptionsInterface } from './histogram-options.interface';
export type { CreateHistogramMetricOptionsInterface } from './create-histogram-metric-options.interface';
export type { InMemoryObservationInterface } from './in-memory-histogram-transport';

export { inMemoryHistogramTransport } from './in-memory-histogram-transport';
export { createHistogramMetric } from './create-histogram-metric';
export { createLegacyHistogramMetric } from './create-legacy-histogram-metric';
