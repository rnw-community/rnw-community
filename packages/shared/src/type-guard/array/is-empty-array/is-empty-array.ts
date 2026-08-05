import { isArray } from '../is-array/is-array.js';

export const isEmptyArray = <T>(array: T): array is T & readonly [] =>
    isArray(array) && array.length === 0;
