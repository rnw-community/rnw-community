import type { HistogramTransportInterface } from './histogram-transport.interface.js';


export interface CreateHistogramMetricOptionsInterface {
    readonly transport: HistogramTransportInterface;
    readonly onLabelsError?: (err: unknown, args: readonly unknown[]) => void;
}
