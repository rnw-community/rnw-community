// @ts-expect-error We ignore prefix, how we can avoid TS error?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SelectorMethods<T extends string> = T extends `${infer Prefix}.${infer Selector}` ? `${Selector}` : never;
