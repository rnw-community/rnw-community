import { isDefined } from '../../generic/is-defined/is-defined';

export interface IsArrayFn {
    <T>(array: T[] | null | undefined): array is T[];
    <T>(array: readonly T[] | null | undefined): array is readonly T[];
}

export const isArray: IsArrayFn = (<T>(array: readonly T[] | null | undefined) =>
    isDefined(array) && Array.isArray(array)) as IsArrayFn;
