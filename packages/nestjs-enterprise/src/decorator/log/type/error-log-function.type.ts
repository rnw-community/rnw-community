export type ErrorLogFunction<TArgs extends unknown[]> = (error: unknown, ...args: TArgs) => string;
