export type ErrorLogInputType<TArgs extends readonly unknown[]> = string | ((error: unknown, ...args: TArgs) => string);
