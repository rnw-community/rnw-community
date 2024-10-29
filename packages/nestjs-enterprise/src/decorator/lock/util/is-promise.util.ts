import { isDefined } from '@rnw-community/shared';

/*
 * TODO: Move to shared?
 * HINT: https://promisesaplus.com/#the-promise-resolution-procedure
 */
export const isPromise = (value: unknown): value is Promise<unknown> =>
    (typeof value === 'object' || typeof value === 'function') &&
    isDefined(value) &&
    'then' in value &&
    typeof value.then === 'function';
