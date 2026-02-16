import { isArray } from '../is-array/is-array';

export const isEmptyArray = <T extends readonly unknown[] | null | undefined>(
    array: T
): array is T & readonly [] => isArray(array) && array.length === 0;

export type IsEmptyArrayFn = typeof isEmptyArray;
