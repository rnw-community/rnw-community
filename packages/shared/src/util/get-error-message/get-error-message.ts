import { isError } from '../../type-guard/generic/is-error/is-error.js';

export const getErrorMessage = (err: unknown, fallback = ''): string => (isError(err) ? err.message : fallback);
