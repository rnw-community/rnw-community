import { isDefined } from '../../generic/is-defined/is-defined';

export const isEmptyArray = <T>(array: T[] | null | undefined): array is never[] =>
    isDefined(array) && Array.isArray(array) && array.length === 0;
