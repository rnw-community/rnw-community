import { isArray } from '../is-array/is-array';

/**
 * Type guard narrowing a value to an array with at least one element, accepting both mutable and `readonly` arrays.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-not-empty-array/is-not-empty-array.md
 */
export const isNotEmptyArray = <T>(
    array: T
): array is T &
    (Extract<T, readonly unknown[]> extends readonly (infer E)[]
        ? readonly [E, ...E[]]
        : readonly [unknown, ...unknown[]]) =>
    isArray(array) && array.length > 0;
