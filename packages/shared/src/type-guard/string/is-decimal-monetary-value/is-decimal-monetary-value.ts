import { isString } from '../is-string/is-string';

const DECIMAL_MONETARY_VALUE_REGEXP = /^-?[0-9]+(\.[0-9]+)?$/u;

export const isDecimalMonetaryValue = (value: unknown): value is string =>
    isString(value) && DECIMAL_MONETARY_VALUE_REGEXP.test(value);
