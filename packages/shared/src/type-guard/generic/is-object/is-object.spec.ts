import { describe, expect, it } from '@jest/globals';

import { isObject } from './is-object';

describe('isObject', () => {
    it('should return true if variable is object', () => {
        expect.hasAssertions();
        expect(isObject({})).toBe(true);
    });

    it('should return false if variable is not an array', () => {
        expect.hasAssertions();

        expect(isObject(undefined)).toBe(false);
        expect(isObject([])).toBe(false);
        expect(isObject('')).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(1 as unknown as unknown[])).toBe(false);
    });
});
