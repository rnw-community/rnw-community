import { isError } from '../../type-guard/generic/is-error/is-error';

/**
 * Extracts the `message` of an `Error` type-safely from an `unknown` catch value, returning `fallback` for non-errors.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/util/get-error-message/get-error-message.md
 */
export const getErrorMessage = (err: unknown, fallback = ''): string => (isError(err) ? err.message : fallback);
