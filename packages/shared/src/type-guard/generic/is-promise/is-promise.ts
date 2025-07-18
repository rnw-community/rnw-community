import { isDefined } from '../is-defined/is-defined';

/*
 * HINT: https://promisesaplus.com/#the-promise-resolution-procedure
 */
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> =>
    (typeof value === 'object' || typeof value === 'function') &&
    isDefined(value) &&
    'then' in value &&
    typeof value.then === 'function';
