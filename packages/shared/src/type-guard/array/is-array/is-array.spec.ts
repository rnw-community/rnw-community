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

    it('should return true if variable is a readonly array', () => {
        expect.hasAssertions();

        const readonlyArray: readonly string[] = ['a', 'b'];
        expect(isArray(readonlyArray)).toBe(true);
    });

    it('should preserve mutability for mutable arrays', () => {
        expect.hasAssertions();

        const array: string[] | undefined = ['a', 'b'];

        if (isArray(array)) {
            array.push('c');
        }

        expect(array).toEqual(['a', 'b', 'c']);
    });
});
