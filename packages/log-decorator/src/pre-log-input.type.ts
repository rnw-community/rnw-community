export type PreLogInputType<TArgs extends readonly unknown[]> = string | ((args: TArgs) => string);
