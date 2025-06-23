import { isDefined } from '../../generic/is-defined/is-defined';

export const isObject = <T>(object: T | null | undefined): object is T =>
    isDefined(object) && typeof object === 'object' && !Array.isArray(object);
