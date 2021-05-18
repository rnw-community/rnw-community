import { isNotEmptyString } from './is-not-empty-string';

describe('isNotEmptyString', () => {
    it('should return true if variable is NOT empty string', () => {
        expect.hasAssertions();
        expect(isNotEmptyString('test')).toStrictEqual(true);
    });

    it('should return false if variable is empty string', () => {
        expect.hasAssertions();
        expect(isNotEmptyString('')).toStrictEqual(false);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isNotEmptyString(null)).toStrictEqual(false);
        expect(isNotEmptyString({})).toStrictEqual(false);
        expect(isNotEmptyString(1)).toStrictEqual(false);
        expect(isNotEmptyString(undefined)).toStrictEqual(false);
    });
});
