import { isDefined } from '../is-defined/is-defined.js';

/**
 * Checks whether a value is a Promise or thenable, per the Promises/A+ resolution procedure.
 *
 * @see https://promisesaplus.com/#the-promise-resolution-procedure
 */
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> =>
    (typeof value === 'object' || typeof value === 'function') &&
    isDefined(value) &&
    'then' in value &&
    typeof value.then === 'function';
