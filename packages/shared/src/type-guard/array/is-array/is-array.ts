import { isDefined } from '../../generic/is-defined/is-defined';

export interface IsArrayFn {
    <T>(array: T): array is T & readonly unknown[];
}

export const isArray: IsArrayFn = (<T>(array: T) => isDefined(array) && Array.isArray(array)) as IsArrayFn;
