export interface HistogramOptionsInterface<TArgs extends readonly unknown[]> {
    readonly name?: string;
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
}
