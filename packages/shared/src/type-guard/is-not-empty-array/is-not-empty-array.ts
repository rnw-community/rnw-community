import { isDefined } from '../is-defined/is-defined';

export const isNotEmptyArray = <T>(array: T[] | undefined): array is T[] =>
    isDefined(array) && Array.isArray(array) && array.length > 0;
