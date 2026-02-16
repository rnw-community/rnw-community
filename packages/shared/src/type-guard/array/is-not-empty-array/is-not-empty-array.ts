import { isArray } from '../is-array/is-array';

export interface IsNotEmptyArrayFn {
    <T extends readonly unknown[] | null | undefined>(array: T): array is T & readonly [unknown, ...unknown[]];
}

export const isNotEmptyArray: IsNotEmptyArrayFn = (<T extends readonly unknown[] | null | undefined>(array: T) =>
    isArray(array) && array.length > 0) as IsNotEmptyArrayFn;
