import { isArray } from '../is-array/is-array';

interface IsEmptyArrayFn {
    <T>(array: T[] | null | undefined): array is never[];
    <T>(array: readonly T[] | null | undefined): array is readonly never[];
}

export const isEmptyArray: IsEmptyArrayFn = (<T>(array: readonly T[] | null | undefined) =>
    isArray(array) && array.length === 0) as IsEmptyArrayFn;
