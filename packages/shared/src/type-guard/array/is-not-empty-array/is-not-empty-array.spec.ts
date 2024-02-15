import { describe, expect, it } from '@jest/globals';

import { isNotEmptyArray } from './is-not-empty-array';

describe('isNotEmptyArray', () => {
    it('should return true if variable is not empty array', () => {
        expect.hasAssertions();
        expect(isNotEmptyArray(['1'])).toBe(true);
    });

    it('should return false if variable is empty array', () => {
        expect.hasAssertions();
        expect(isNotEmptyArray([])).toBe(false);
    });

    it('should return false if variable is not an array', () => {
        expect.hasAssertions();

        expect(isNotEmptyArray(undefined)).toBe(false);
        expect(isNotEmptyArray(1 as unknown as unknown[])).toBe(false);
    });
});
