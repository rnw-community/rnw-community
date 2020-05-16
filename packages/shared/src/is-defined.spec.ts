import { isDefined } from './is-defined';

describe('isDefined', () => {
    it('should return true if variable is defined', () => {
        expect(isDefined({})).toEqual(true);
    });
    it('should return false if variable is undefined', () => {
        expect(isDefined(undefined)).toEqual(false);
    });
    it('should return false if variable is null', () => {
        expect(isDefined(null)).toEqual(false);
    });
});
