import { isArray } from '../is-array/is-array';

export const isEmptyArray = <T>(array: readonly T[] | null | undefined): array is readonly never[] =>
    isArray(array) && array.length === 0;
