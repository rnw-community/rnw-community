import { isString } from '../is-string/is-string';

const DECIMAL_MONETARY_VALUE_REGEXP = /^-?[0-9]+(\.[0-9]+)?$/u;

/**
 * Type guard narrowing a value to a decimal-formatted numeric string such as a currency amount (`^-?[0-9]+(\.[0-9]+)?$`).
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-decimal-monetary-value/is-decimal-monetary-value.md
 */
export const isDecimalMonetaryValue = (value: unknown): value is string =>
    isString(value) && DECIMAL_MONETARY_VALUE_REGEXP.test(value);
