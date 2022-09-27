export type SelectorMethods<T extends string> = T extends `${string}.${infer Selector}`
    ? Selector extends `Root`
        ? never
        : `${Selector}`
    : never;
