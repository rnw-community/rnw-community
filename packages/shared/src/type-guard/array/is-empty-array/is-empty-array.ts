import { isArray } from '../is-array/is-array';

export interface IsEmptyArrayFn {
    <T>(array: T[] | null | undefined): array is never[];
    <T>(array: readonly T[] | null | undefined): array is readonly never[];
    <T extends readonly unknown[]>(array: T | null | undefined): array is T & readonly [];
}

export const isEmptyArray: IsEmptyArrayFn = (<T>(array: readonly T[] | null | undefined) =>
    isArray(array) && array.length === 0) as IsEmptyArrayFn;
