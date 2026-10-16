/**
 * A readonly tuple type of `T` guaranteed to contain at least one element.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/readonly-is-not-empty-array-type/readonly-is-not-empty-array.type.md
 */
export type ReadonlyIsNotEmptyArray<T> = readonly [T, ...T[]];
