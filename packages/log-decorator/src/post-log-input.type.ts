export type PostLogInputType<TArgs extends readonly unknown[], TResult> = string | ((result: TResult, ...args: TArgs) => string);
