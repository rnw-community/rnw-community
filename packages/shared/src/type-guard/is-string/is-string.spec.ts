import { isString } from './is-string';

describe('isString', () => {
    it('should return true if variable is a empty string', () => {
        expect.hasAssertions();
        expect(isString('')).toBe(true);
    });

    it('should return true if variable is not empty string', () => {
        expect.hasAssertions();
        expect(isString('value')).toBe(true);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isString(null)).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(1)).toBe(false);
        expect(isString(undefined)).toBe(false);
    });
});
