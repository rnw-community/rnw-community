export type PreLogInputType<TArgs extends readonly unknown[]> = string | ((args: TArgs) => string);
export type PostLogInputType<TArgs extends readonly unknown[], TResult> = string | ((result: TResult, args: TArgs) => string);
export type ErrorLogInputType<TArgs extends readonly unknown[]> = string | ((error: unknown, args: TArgs) => string);
