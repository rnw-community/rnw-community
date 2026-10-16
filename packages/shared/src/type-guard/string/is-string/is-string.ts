import { isDefined } from '../../generic/is-defined/is-defined';

/**
 * Type guard narrowing a value to `string`, including the empty string.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/string/is-string/is-string.md
 */
export const isString = (value: unknown): value is string => isDefined(value) && typeof value === 'string';
