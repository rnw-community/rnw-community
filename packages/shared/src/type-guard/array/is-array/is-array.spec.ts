import { describe, expect, it } from '@jest/globals';

import { isArray } from './is-array';

describe('isArray', () => {
    it('should return true if variable is array', () => {
        expect.hasAssertions();
        expect(isArray([])).toBe(true);
    });

    it('should return false if variable is not an array', () => {
        expect.hasAssertions();

        expect(isArray(undefined)).toBe(false);

        expect(isArray(1 as unknown as unknown[])).toBe(false);
    });
});
