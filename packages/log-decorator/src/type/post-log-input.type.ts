export type PostLogInputType<TArgs extends readonly unknown[], TResult> =
    | string
    | ((result: TResult, durationMs: number, ...args: TArgs) => string);
