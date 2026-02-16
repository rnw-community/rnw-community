import { isArray } from '../is-array/is-array';

export interface IsEmptyArrayFn {
    <T extends readonly unknown[] | null | undefined>(array: T): array is T & readonly [];
}

export const isEmptyArray: IsEmptyArrayFn = (<T extends readonly unknown[] | null | undefined>(array: T) =>
    isArray(array) && array.length === 0) as IsEmptyArrayFn;
