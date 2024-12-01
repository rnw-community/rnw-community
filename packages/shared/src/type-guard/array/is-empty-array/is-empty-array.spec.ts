import { describe, expect, it } from '@jest/globals';

import { isEmptyArray } from './is-empty-array';

describe('isEmptyArray', () => {
    it('should return true if variable is empty array', () => {
        expect.hasAssertions();
        expect(isEmptyArray([])).toBe(true);
    });

    it('should return false if variable is NOT empty array', () => {
        expect.hasAssertions();
        expect(isEmptyArray(['1'])).toBe(false);
    });

    it('should return false if variable is not an array', () => {
        expect.hasAssertions();

        expect(isEmptyArray(undefined)).toBe(false);

        expect(isEmptyArray(1 as unknown as unknown[])).toBe(false);
    });
});
