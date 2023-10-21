import { isNumber } from './is-number';

describe('isNumber', () => {
    it('should return true if variable is a number', () => {
        expect.hasAssertions();
        expect(isNumber(1)).toBe(true);
        expect(isNumber(NaN)).toBe(true);
    });

    it('should return false if variable is not a number', () => {
        expect.hasAssertions();

        expect(isNumber(null)).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber('test')).toBe(false);
        expect(isNumber(undefined)).toBe(false);
    });
});
