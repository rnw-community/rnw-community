import type { HistogramTransportInterface } from './histogram-transport.interface';


/**
 * The options accepted by `createHistogramMetricDecorator`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/histogram-metric-decorator/readme.md#createhistogrammetricoptionsinterface
 */
export interface CreateHistogramMetricOptionsInterface {
    /** The transport every decoration created by the factory observes durations on. */
    readonly transport: HistogramTransportInterface;
    /** Called with the error and method arguments when a `labels` callback throws, with its own throws swallowed. */
    readonly onLabelsError?: (err: unknown, args: readonly unknown[]) => void;
}
