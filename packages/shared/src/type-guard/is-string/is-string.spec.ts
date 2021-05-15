import { isString } from './is-string';

describe('isString', () => {
    it('should return true if variable is a empty string', () => {
        expect(isString('')).toEqual(true);
    });
    it('should return true if variable is not empty string', () => {
        expect(isString('value')).toEqual(true);
    });
    it('should return false if variable is not a string', () => {
        expect(isString(null)).toEqual(false);
        expect(isString({})).toEqual(false);
        expect(isString(1)).toEqual(false);
        expect(isString(undefined)).toEqual(false);
    });
});
