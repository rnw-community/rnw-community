export interface HistogramTransportInterface {
    readonly observe: (name: string, durationMs: number, labels?: Readonly<Record<string, string>>) => void;
}
