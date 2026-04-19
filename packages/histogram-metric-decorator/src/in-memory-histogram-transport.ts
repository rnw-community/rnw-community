import type { HistogramTransportInterface } from './histogram-transport.interface';

export interface InMemoryObservationInterface {
    readonly name: string;
    readonly durationMs: number;
    readonly labels?: Readonly<Record<string, string>>;
}

/**
 * In-memory histogram transport — intended for unit tests and simple use-cases
 * where a real metrics backend is not available.
 *
 * Returns a transport that accumulates observations internally. Call `.snapshot()`
 * to read (and clear) all recorded observations.
 *
 * @example
 * ```ts
 * const transport = inMemoryHistogramTransport();
 * const HistogramMetric = createHistogramMetric({ transport });
 *
 * // ... exercise decorated methods ...
 *
 * const observations = transport.snapshot();
 * console.log(observations); // [{ name: 'MyService_doWork_duration_ms', durationMs: 12 }]
 * ```
 */
export const inMemoryHistogramTransport = (): HistogramTransportInterface & {
    readonly snapshot: () => ReadonlyArray<InMemoryObservationInterface>;
} => {
    const observations: InMemoryObservationInterface[] = [];

    return {
        observe: (name: string, durationMs: number, labels?: Readonly<Record<string, string>>): void => {
            observations.push({ name, durationMs, ...(labels !== undefined ? { labels } : {}) });
        },
        snapshot: (): ReadonlyArray<InMemoryObservationInterface> => observations.splice(0),
    };
};
