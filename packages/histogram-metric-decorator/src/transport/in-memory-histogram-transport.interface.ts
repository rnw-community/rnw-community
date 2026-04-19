import type { HistogramTransportInterface } from '../interface/histogram-transport.interface';
import type { InMemoryObservationInterface } from './in-memory-observation.interface';

export interface InMemoryHistogramTransportInterface extends HistogramTransportInterface {
    readonly snapshot: () => ReadonlyArray<InMemoryObservationInterface>;
}
