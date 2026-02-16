import { isDefined } from '../../generic/is-defined/is-defined';

export interface IsArrayFn {
    <T>(array: T[] | null | undefined): array is T[];
    <T>(array: readonly T[] | null | undefined): array is readonly T[];
    <T extends readonly unknown[]>(array: T | null | undefined): array is T;
}

export const isArray: IsArrayFn = (<T>(array: readonly T[] | null | undefined) =>
    isDefined(array) && Array.isArray(array)) as IsArrayFn;
