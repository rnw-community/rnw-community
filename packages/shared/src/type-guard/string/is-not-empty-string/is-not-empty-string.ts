import { isString } from '../is-string/is-string';

/**
 * Type guard narrowing a value to a string with at least one character.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-not-empty-string/is-not-empty-string.md
 */
export const isNotEmptyString = (value: unknown): value is string => isString(value) && value.length > 0;
