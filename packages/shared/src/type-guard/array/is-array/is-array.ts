import { isDefined } from '../../generic/is-defined/is-defined';

export const isArray = <T>(array: T): array is T & readonly unknown[] => isDefined(array) && Array.isArray(array);
