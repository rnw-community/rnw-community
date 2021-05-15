import { isString } from './is-string';

describe('isString', () => {
    it('should return true if variable is a empty string', () => {
        expect.hasAssertions();
        expect(isString('')).toStrictEqual(true);
    });

    it('should return true if variable is not empty string', () => {
        expect.hasAssertions();
        expect(isString('value')).toStrictEqual(true);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isString(null)).toStrictEqual(false);
        expect(isString({})).toStrictEqual(false);
        expect(isString(1)).toStrictEqual(false);
        expect(isString(undefined)).toStrictEqual(false);
    });
});
