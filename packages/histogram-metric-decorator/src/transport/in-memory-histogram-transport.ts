import type { InMemoryHistogramTransportInterface } from '../interface/in-memory-histogram-transport.interface';
import type { InMemoryObservationInterface } from '../interface/in-memory-observation.interface';

export const inMemoryHistogramTransport = (): InMemoryHistogramTransportInterface => {
    const observations: InMemoryObservationInterface[] = [];

    return {
        observe: (name, durationMs, labels) => {
            const labelsEntry = labels ? { labels } : {};
            observations.push({ name, durationMs, ...labelsEntry });
        },
        snapshot: () => observations.splice(0),
    };
};
