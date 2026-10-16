/**
 * The optional per-decoration configuration of the histogram metric decorator.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/histogram-metric-decorator/readme.md#histogramoptionsinterfacetargs
 */
export interface HistogramOptionsInterface<TArgs extends readonly unknown[]> {
    /**
     * The metric name the duration is observed under.
     *
     * @defaultValue `` `${className}_${methodName}_duration_ms` ``
     */
    readonly name?: string;
    /** Builds the observation labels from the method arguments, with a throw falling back to an unlabelled observation. */
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
}
