import { isError } from '../../type-guard/generic/is-error/is-error';

/**
 * Get Error message as string type-safely, or show fallback message.
 *
 * This util should be used inside catch blocks to get error message text type-safely when
 * using `catch(err:unknown)...`
 *
 * @param err unknown Instance of Error from catch block
 * @param fallback string Fallback message if err is not an instance of Error
 *
 * @returns string
 */
export const getErrorMessage = (err: unknown, fallback = ''): string => (isError(err) ? err.message : fallback);
