import { describe, expect, it } from '@jest/globals';

import { isNotEmptyString } from './is-not-empty-string';

describe('isNotEmptyString', () => {
    it('should return true if variable is NOT empty string', () => {
        expect.hasAssertions();
        expect(isNotEmptyString('test')).toBe(true);
    });

    it('should return false if variable is empty string', () => {
        expect.hasAssertions();
        expect(isNotEmptyString('')).toBe(false);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isNotEmptyString(null)).toBe(false);
        expect(isNotEmptyString({})).toBe(false);
        expect(isNotEmptyString(1)).toBe(false);
        expect(isNotEmptyString(undefined)).toBe(false);
    });
});
