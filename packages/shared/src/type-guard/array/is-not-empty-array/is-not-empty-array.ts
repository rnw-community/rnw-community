import { isArray } from '../is-array/is-array';

import type { ReadonlyIsNotEmptyArray } from '../../../type/readonly-is-not-empty-array-type/readonly-is-not-empty-array.type';

export const isNotEmptyArray = <T>(array: readonly T[] | null | undefined): array is ReadonlyIsNotEmptyArray<T> =>
    isArray(array) && array.length > 0;
