import { isArray } from '../../array/is-array/is-array.js';
import { isDefined } from '../../generic/is-defined/is-defined.js';

export const isObject = <T>(value: T): value is T & object => isDefined(value) && typeof value === 'object' && !isArray(value);
