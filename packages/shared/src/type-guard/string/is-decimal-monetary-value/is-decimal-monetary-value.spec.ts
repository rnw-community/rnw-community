import { describe, expect, it } from '@jest/globals';

import { isDecimalMonetaryValue } from './is-decimal-monetary-value';

describe('isDecimalMonetaryValue', () => {
    it('should return true for integer decimal strings', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('0')).toBe(true);
        expect(isDecimalMonetaryValue('10')).toBe(true);
        expect(isDecimalMonetaryValue('007')).toBe(true);
    });

    it('should return true for fractional decimal strings', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('10.00')).toBe(true);
        expect(isDecimalMonetaryValue('10.5')).toBe(true);
        expect(isDecimalMonetaryValue('10.000000000001')).toBe(true);
    });

    it('should return true for negative decimal strings', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('-10.00')).toBe(true);
        expect(isDecimalMonetaryValue('-0')).toBe(true);
    });

    it('should return false for strings with a trailing decimal point', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('10.')).toBe(false);
        expect(isDecimalMonetaryValue('10.00.')).toBe(false);
    });

    it('should return false for strings with a leading decimal point', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('.10')).toBe(false);
    });

    it('should return false for strings with a leading plus sign', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('+10')).toBe(false);
    });

    it('should return false for strings with thousand separators, exponents or whitespace', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('1,000.00')).toBe(false);
        expect(isDecimalMonetaryValue('1e10')).toBe(false);
        expect(isDecimalMonetaryValue('  10  ')).toBe(false);
        expect(isDecimalMonetaryValue('10.0.0')).toBe(false);
    });

    it('should return false for empty or non-numeric strings', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue('')).toBe(false);
        expect(isDecimalMonetaryValue('-')).toBe(false);
        expect(isDecimalMonetaryValue('.')).toBe(false);
        expect(isDecimalMonetaryValue('NaN')).toBe(false);
    });

    it('should return false for non-string values', () => {
        expect.hasAssertions();

        expect(isDecimalMonetaryValue(10)).toBe(false);
        expect(isDecimalMonetaryValue(true)).toBe(false);
        expect(isDecimalMonetaryValue(null)).toBe(false);
        expect(isDecimalMonetaryValue(undefined)).toBe(false);
        expect(isDecimalMonetaryValue({})).toBe(false);
    });
});
