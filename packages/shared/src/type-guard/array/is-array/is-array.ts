import { isDefined } from '../../generic/is-defined/is-defined';

/**
 * Type guard narrowing a value to an array, accepting both mutable and `readonly` arrays.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/array/is-array/is-array.md
 */
export const isArray = <T>(array: T): array is T & readonly unknown[] => isDefined(array) && Array.isArray(array);
