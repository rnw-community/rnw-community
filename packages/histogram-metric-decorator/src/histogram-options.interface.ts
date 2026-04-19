export interface HistogramOptionsInterface<TArgs extends readonly unknown[]> {
    /**
     * Metric name. Defaults to `"<ClassName>_<methodName>_duration_ms"` when omitted,
     * where ClassName and methodName are resolved at call time via the execution context.
     */
    readonly name?: string;

    /**
     * Optional label factory. Receives the method's arguments and must return a plain
     * string–string record. Invoked on every call (both success and error paths).
     */
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
}
