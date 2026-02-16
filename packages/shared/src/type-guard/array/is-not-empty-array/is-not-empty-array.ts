import { isArray } from '../is-array/is-array';

export const isNotEmptyArray = <T extends readonly unknown[]>(
    array: T | null | undefined
): array is T & readonly [T[number], ...T[number][]] => isArray(array) && array.length > 0;
