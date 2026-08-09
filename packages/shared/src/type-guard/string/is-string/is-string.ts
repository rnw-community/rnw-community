import { isDefined } from '../../generic/is-defined/is-defined';

export const isString = (value: unknown): value is string => isDefined(value) && typeof value === 'string';
