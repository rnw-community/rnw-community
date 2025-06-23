import { isDefined } from '../../generic/is-defined/is-defined';

export const isArray = <T>(array: T[] | null | undefined): array is T[] => isDefined(array) && Array.isArray(array);
