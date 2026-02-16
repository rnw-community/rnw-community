import { isArray } from '../is-array/is-array';

export const isNotEmptyArray = <T>(
    array: T
): array is T &
    (Extract<T, readonly unknown[]> extends readonly (infer E)[]
        ? readonly [E, ...E[]]
        : readonly [unknown, ...unknown[]]) =>
    isArray(array) && array.length > 0;
