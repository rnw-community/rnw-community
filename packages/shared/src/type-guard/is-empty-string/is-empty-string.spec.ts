import { isEmptyString } from './is-empty-string';

describe('isEmptyString', () => {
    it('should return true if variable is empty string', () => {
        expect.hasAssertions();
        expect(isEmptyString('')).toStrictEqual(true);
    });

    it('should return false if variable is not empty string', () => {
        expect.hasAssertions();
        expect(isEmptyString(' ')).toStrictEqual(false);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isEmptyString(null)).toStrictEqual(false);
        expect(isEmptyString({})).toStrictEqual(false);
        expect(isEmptyString(1)).toStrictEqual(false);
        expect(isEmptyString(undefined)).toStrictEqual(false);
    });
});
