import { isArray } from '../../array/is-array/is-array';
import { isDefined } from '../../generic/is-defined/is-defined';

/**
 * Type guard narrowing a value to a non-null, non-array `object`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/shared/src/type-guard/generic/is-object/is-object.md
 */
export const isObject = <T>(value: T): value is T & object => isDefined(value) && typeof value === 'object' && !isArray(value);
