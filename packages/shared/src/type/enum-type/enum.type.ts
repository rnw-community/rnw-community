/**
 * A string-keyed record type describing a TypeScript enum-like object with values of type `D`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/enum-type/enum.type.md
 */
export type Enum<D = unknown> = Record<string, D>;
