import { isError } from './is-error';

describe('isError', () => {
    it('should return true if variable is Error', () => {
        expect.hasAssertions();
        expect(isError(new Error())).toStrictEqual(true);
    });

    it('should return false if variable is not Error', () => {
        expect.hasAssertions();

        expect(isError(null)).toStrictEqual(false);
        expect(isError({})).toStrictEqual(false);
        expect(isError(1)).toStrictEqual(false);
        expect(isError(undefined)).toStrictEqual(false);
    });
});
