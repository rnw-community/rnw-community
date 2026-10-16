/**
 * Type guard narrowing a value to `number`, including `NaN`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/number/is-number/is-number.md
 */
export const isNumber = (value: unknown): value is number => typeof value === 'number';
