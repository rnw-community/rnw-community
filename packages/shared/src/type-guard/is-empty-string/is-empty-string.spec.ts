import { isEmptyString } from './is-empty-string';

describe('isEmptyString', () => {
    it('should return true if variable is empty string', () => {
        expect(isEmptyString('')).toEqual(true);
    });
    it('should return false if variable is not empty string', () => {
        expect(isEmptyString(' ')).toEqual(false);
    });
    it('should return false if variable is not a string', () => {
        expect(isEmptyString(null)).toEqual(false);
        expect(isEmptyString({})).toEqual(false);
        expect(isEmptyString(1)).toEqual(false);
        expect(isEmptyString(undefined)).toEqual(false);
    });
});
