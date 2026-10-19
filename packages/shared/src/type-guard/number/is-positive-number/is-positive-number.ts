import { isNumber } from '../is-number/is-number';

/**
 * Type guard narrowing a value to a `number` strictly greater than zero.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/number/is-positive-number/is-positive-number.md
 */
export const isPositiveNumber = (value: unknown): value is number => isNumber(value) && value > 0;
