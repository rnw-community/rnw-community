import { describe, expect, it } from '@jest/globals';

import { isEmptyString } from './is-empty-string';

describe('isEmptyString', () => {
    it('should return true if variable is empty string', () => {
        expect.hasAssertions();
        expect(isEmptyString('')).toBe(true);
    });

    it('should return false if variable is not empty string', () => {
        expect.hasAssertions();
        expect(isEmptyString(' ')).toBe(false);
    });

    it('should return false if variable is not a string', () => {
        expect.hasAssertions();

        expect(isEmptyString(null)).toBe(false);
        expect(isEmptyString({})).toBe(false);
        expect(isEmptyString(1)).toBe(false);
        expect(isEmptyString(undefined)).toBe(false);
    });
});
