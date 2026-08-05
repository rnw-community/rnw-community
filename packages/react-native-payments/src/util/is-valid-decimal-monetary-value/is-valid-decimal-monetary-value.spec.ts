import { describe, expect, it } from '@jest/globals';

import { isValidDecimalMonetaryValue } from './is-valid-decimal-monetary-value.util.js';

describe('isValidDecimalMonetaryValue', () => {
    it('should return true for number amounts', () => {
        expect.hasAssertions();

        expect(isValidDecimalMonetaryValue(10)).toBe(true);
        expect(isValidDecimalMonetaryValue(-10)).toBe(true);
        expect(isValidDecimalMonetaryValue(0)).toBe(true);
    });

    it('should return true for decimal-formatted string amounts', () => {
        expect.hasAssertions();

        expect(isValidDecimalMonetaryValue('10.00')).toBe(true);
        expect(isValidDecimalMonetaryValue('-10.00')).toBe(true);
        expect(isValidDecimalMonetaryValue('0')).toBe(true);
    });

    it('should return false for a string amount with a trailing decimal point', () => {
        expect.hasAssertions();

        expect(isValidDecimalMonetaryValue('10.00.')).toBe(false);
        expect(isValidDecimalMonetaryValue('10.')).toBe(false);
    });

    it('should return false for a string amount with a leading plus sign or missing integer part', () => {
        expect.hasAssertions();

        expect(isValidDecimalMonetaryValue('+10')).toBe(false);
        expect(isValidDecimalMonetaryValue('.10')).toBe(false);
    });

    it('should return false for non-number, non-string amounts', () => {
        expect.hasAssertions();

        expect(isValidDecimalMonetaryValue(true as unknown as string)).toBe(false);
        expect(isValidDecimalMonetaryValue(null as unknown as string)).toBe(false);
        expect(isValidDecimalMonetaryValue(undefined as unknown as string)).toBe(false);
    });
});
