import { isArray } from '../is-array/is-array';

/**
 * Type guard narrowing a value to an empty array, accepting both mutable and `readonly` arrays.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-empty-array/is-empty-array.md
 */
export const isEmptyArray = <T>(array: T): array is T & readonly [] =>
    isArray(array) && array.length === 0;
