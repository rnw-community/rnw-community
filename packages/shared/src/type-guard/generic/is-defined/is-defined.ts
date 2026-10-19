/**
 * Type guard narrowing a value to non-nullable by excluding both `undefined` and `null`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-defined/is-defined.md
 */
// eslint-disable-next-line no-undefined
export const isDefined = <T>(value: T | null | undefined): value is T => value !== undefined && value !== null;
