import { isArray } from '../is-array/is-array';

export const isEmptyArray = <T>(array: T[] | null | undefined): array is never[] => isArray(array) && array.length === 0;
