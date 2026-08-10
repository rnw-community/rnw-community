import { isString } from '../is-string/is-string';

export const isNotEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
