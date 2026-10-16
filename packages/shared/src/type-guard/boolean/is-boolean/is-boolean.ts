/**
 * Type guard narrowing a value to `boolean`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/boolean/is-boolean/is-boolean.md
 */
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
