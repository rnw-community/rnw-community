import { isArray } from '../../array/is-array/is-array';
import { isDefined } from '../../generic/is-defined/is-defined';

export const isObject = <T>(value: T): value is T & object => isDefined(value) && typeof value === 'object' && !isArray(value);
