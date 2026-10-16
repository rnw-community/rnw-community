import { isDefined } from '../is-defined/is-defined';

/**
 * Type guard narrowing a value to a `Promise`, accepting any thenable per the Promises/A+ resolution procedure.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-promise/is-promise.md
 * @see https://promisesaplus.com/#the-promise-resolution-procedure
 */
export const isPromise = <T = unknown>(value: unknown): value is Promise<T> =>
    (typeof value === 'object' || typeof value === 'function') &&
    isDefined(value) &&
    'then' in value &&
    typeof value.then === 'function';
