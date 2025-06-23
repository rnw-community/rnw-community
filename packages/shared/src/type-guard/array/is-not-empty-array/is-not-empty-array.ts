import { isArray } from '../is-array/is-array';

import type { IsNotEmptyArray } from '../../../type/is-not-empty-array-type/is-not-empty-array.type';

export const isNotEmptyArray = <T>(array: T[] | null | undefined): array is IsNotEmptyArray<T> =>
    isArray(array) && array.length > 0;
