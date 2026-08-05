import { isNotEmptyArray } from '../is-not-empty-array/is-not-empty-array.js';

export const isNotEmptyArrayOf = <T, S>(
    array: T,
    guard: (item: unknown) => item is S
): array is T & readonly [S, ...S[]] => isNotEmptyArray(array) && array.every(guard);
