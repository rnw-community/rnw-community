import type { InMemoryObservationInterface } from './in-memory-observation.interface';
import type { HistogramTransportInterface } from '../interface/histogram-transport.interface';

export interface InMemoryHistogramTransportInterface extends HistogramTransportInterface {
    readonly snapshot: () => ReadonlyArray<InMemoryObservationInterface>;
}
