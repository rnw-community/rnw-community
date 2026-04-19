import type { HistogramTransportInterface } from '../../interface/histogram-transport-interface/histogram-transport.interface';

export interface InMemoryObservationInterface {
    readonly name: string;
    readonly durationMs: number;
    readonly labels?: Readonly<Record<string, string>>;
}

export interface InMemoryHistogramTransportInterface extends HistogramTransportInterface {
    readonly snapshot: () => ReadonlyArray<InMemoryObservationInterface>;
}

export const inMemoryHistogramTransport = (): InMemoryHistogramTransportInterface => {
    const observations: InMemoryObservationInterface[] = [];

    return {
        observe: (name, durationMs, labels) => {
            observations.push({ name, durationMs, ...(labels !== undefined ? { labels } : {}) });
        },
        snapshot: () => observations.splice(0),
    };
};
