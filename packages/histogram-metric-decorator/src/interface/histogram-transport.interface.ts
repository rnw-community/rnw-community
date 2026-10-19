/**
 * The metrics backend (Prometheus, OpenTelemetry, in-memory) that receives each recorded method duration.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/histogram-metric-decorator/readme.md#histogramtransportinterface
 */
export interface HistogramTransportInterface {
    /** Records one duration observation in milliseconds under the metric name with optional labels. */
    readonly observe: (name: string, durationMs: number, labels?: Readonly<Record<string, string>>) => void;
}
