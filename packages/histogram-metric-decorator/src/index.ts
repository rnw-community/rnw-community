export type { HistogramTransportInterface } from './interface/histogram-transport.interface';
export type { HistogramOptionsInterface } from './interface/histogram-options.interface';
export type { CreateHistogramMetricOptionsInterface } from './interface/create-histogram-metric-options.interface';
export type { InMemoryObservationInterface } from './interface/in-memory-observation.interface';
export type { InMemoryHistogramTransportInterface } from './interface/in-memory-histogram-transport.interface';

export { inMemoryHistogramTransport } from './transport/in-memory-histogram-transport';

export { createHistogramMetricDecorator } from './factory/create-histogram-metric-decorator/create-histogram-metric-decorator';
