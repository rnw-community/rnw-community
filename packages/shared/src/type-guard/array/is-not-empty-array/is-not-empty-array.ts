import { isArray } from '../is-array/is-array';

import type { IsNotEmptyArray } from '../../../type/is-not-empty-array-type/is-not-empty-array.type';
import type { ReadonlyIsNotEmptyArray } from '../../../type/readonly-is-not-empty-array-type/readonly-is-not-empty-array.type';

interface IsNotEmptyArrayFn {
    <T>(array: T[] | null | undefined): array is IsNotEmptyArray<T>;
    <T>(array: readonly T[] | null | undefined): array is ReadonlyIsNotEmptyArray<T>;
}

export const isNotEmptyArray: IsNotEmptyArrayFn = (<T>(array: readonly T[] | null | undefined) =>
    isArray(array) && array.length > 0) as IsNotEmptyArrayFn;
