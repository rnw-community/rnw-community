import { isDefined } from '../../generic/is-defined/is-defined';

export const isArray = <T>(array: readonly T[] | null | undefined): array is readonly T[] =>
    isDefined(array) && Array.isArray(array);
