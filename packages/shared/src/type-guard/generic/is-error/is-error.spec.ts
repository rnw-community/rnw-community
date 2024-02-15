import { describe, expect, it } from '@jest/globals';

import { isError } from './is-error';

describe('isError', () => {
    it('should return true if variable is Error', () => {
        expect.hasAssertions();
        expect(isError(new Error())).toBe(true);
    });

    it('should return false if variable is not Error', () => {
        expect.hasAssertions();

        expect(isError(null)).toBe(false);
        expect(isError({})).toBe(false);
        expect(isError(1)).toBe(false);
        expect(isError(undefined)).toBe(false);
    });
});
