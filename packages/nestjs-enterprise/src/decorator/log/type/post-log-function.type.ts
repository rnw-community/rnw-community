export type PostLogFunction<T, TArgs extends unknown[]> = (result: T, ...args: TArgs) => string;
