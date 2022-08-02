export type SelectorMethods<T extends string> = T extends `${string}.${infer Selector}` ? `${Selector}` : never;
