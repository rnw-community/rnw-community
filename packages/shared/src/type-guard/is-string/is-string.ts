import { isDefined } from '../is-defined/is-defined';

export const isString = (value: unknown): value is string => isDefined(value) && typeof value === 'string';
