import { isArray } from '../is-array/is-array';

export const isNotEmptyArray = <T extends readonly unknown[] | null | undefined>(
    array: T
): array is T & readonly [unknown, ...unknown[]] => isArray(array) && array.length > 0;

export type IsNotEmptyArrayFn = typeof isNotEmptyArray;
