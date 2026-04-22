import type { HistogramTransportInterface } from '../interface/histogram-transport.interface';

interface InMemoryObservationMock {
    readonly name: string;
    readonly durationMs: number;
    readonly labels?: Readonly<Record<string, string>>;
}

interface InMemoryHistogramTransportMock extends HistogramTransportInterface {
    readonly snapshot: () => ReadonlyArray<InMemoryObservationMock>;
}

export const inMemoryHistogramTransportMock = (): InMemoryHistogramTransportMock => {
    const observations: InMemoryObservationMock[] = [];

    return {
        observe: (name, durationMs, labels) => {
            const labelsEntry = labels ? { labels } : {};
            observations.push({ name, durationMs, ...labelsEntry });
        },
        snapshot: () => observations.splice(0),
    };
};
