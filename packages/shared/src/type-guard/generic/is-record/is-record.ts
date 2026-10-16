import { isObject } from '../is-object/is-object';

/**
 * Type guard narrowing a value to an indexable `Record<PropertyKey, unknown>`, rejecting `null` and arrays.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-record/is-record.md
 */
export const isRecord = <T>(value: T): value is T & Record<PropertyKey, unknown> => isObject(value);
