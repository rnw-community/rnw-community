import { isString } from '../is-string/is-string';

/**
 * Type guard narrowing a value to a string of zero length.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-empty-string/is-empty-string.md
 */
export const isEmptyString = (value: unknown): value is string => isString(value) && value.length === 0;
