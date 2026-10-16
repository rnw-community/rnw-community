import { isNotEmptyArray } from '../is-not-empty-array/is-not-empty-array';

/**
 * Type guard narrowing a value to a non-empty array whose every element passes the supplied element guard.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-not-empty-array-of/is-not-empty-array-of.md
 */
export const isNotEmptyArrayOf = <T, S>(
    array: T,
    guard: (item: unknown) => item is S
): array is T & readonly [S, ...S[]] => isNotEmptyArray(array) && array.every(guard);
