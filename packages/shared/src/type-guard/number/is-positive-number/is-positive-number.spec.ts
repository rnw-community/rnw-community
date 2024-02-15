import { describe, expect, it } from '@jest/globals';

import { isPositiveNumber } from './is-positive-number';

describe('isPositiveNumber', () => {
    it('should return true if variable is a positive number', () => {
        expect.hasAssertions();
        expect(isPositiveNumber(1)).toBe(true);
    });

    it('should return false if variable is not a positive number', () => {
        expect.hasAssertions();

        expect(isPositiveNumber(0)).toBe(false);
        expect(isPositiveNumber(-1)).toBe(false);
        expect(isPositiveNumber(NaN)).toBe(false);
    });
});
