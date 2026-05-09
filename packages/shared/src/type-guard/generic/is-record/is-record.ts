import { isObject } from '../is-object/is-object';

export const isRecord = <T>(value: T): value is T & Record<PropertyKey, unknown> => isObject(value);
