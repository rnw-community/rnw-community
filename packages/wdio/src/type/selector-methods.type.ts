// @ts-expect-error We ignore prefix, how we can avoid TS error?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type SelectorMethods<T extends string, S extends string> = T extends `${infer Prefix}.${infer Selector}`
    ? Selector extends `Root`
        ? never
        : `${Selector}${S}`
    : never;
