import { isDefined } from '../../generic/is-defined/is-defined';

import type { IsNotEmptyArray } from '../../../type/is-not-empty-array-type/is-not-empty-array.type';

export const isNotEmptyArray = <T>(array: T[] | null | undefined): array is IsNotEmptyArray<T> =>
    isDefined(array) && Array.isArray(array) && array.length > 0;
