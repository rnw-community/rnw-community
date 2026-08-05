import { isString } from '../is-string/is-string.js';

export const isEmptyString = (value: unknown): value is string => isString(value) && value.length === 0;
