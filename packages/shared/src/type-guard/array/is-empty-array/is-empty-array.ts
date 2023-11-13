import { isDefined } from '../../generic/is-defined/is-defined';

export const isEmptyArray = <T>(array: T[] | null | undefined): array is T[] =>
    isDefined(array) && Array.isArray(array) && array.length === 0;
