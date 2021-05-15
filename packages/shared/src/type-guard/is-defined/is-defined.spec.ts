import { isDefined } from './is-defined';

describe('isDefined', () => {
    it('should return true if variable is defined', () => {
        expect.hasAssertions();
        expect(isDefined({})).toStrictEqual(true);
    });

    it('should return false if variable is undefined', () => {
        expect.hasAssertions();
        expect(isDefined(undefined)).toStrictEqual(false);
    });

    it('should return false if variable is null', () => {
        expect.hasAssertions();
        expect(isDefined(null)).toStrictEqual(false);
    });
});
