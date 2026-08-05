import { isNumber } from '../is-number/is-number.js';

export const isPositiveNumber = (value: unknown): value is number => isNumber(value) && value > 0;
