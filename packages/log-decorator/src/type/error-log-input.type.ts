export type ErrorLogInputType<TArgs extends readonly unknown[]> =
    | string
    | ((error: unknown, durationMs: number, ...args: TArgs) => string);
