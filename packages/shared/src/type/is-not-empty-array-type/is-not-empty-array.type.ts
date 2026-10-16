/**
 * A mutable tuple type of `T` guaranteed to contain at least one element.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type/is-not-empty-array-type/is-not-empty-array.type.md
 */
export type IsNotEmptyArray<T> = [T, ...T[]];
