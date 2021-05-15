import { isError } from './is-error';

describe('isError', () => {
    it('should return true if variable is Error', () => {
        expect(isError(new Error())).toEqual(true);
    });
    it('should return false if variable is not Error', () => {
        expect(isError(null)).toEqual(false);
        expect(isError({})).toEqual(false);
        expect(isError(1)).toEqual(false);
        expect(isError(undefined)).toEqual(false);
    });
});
