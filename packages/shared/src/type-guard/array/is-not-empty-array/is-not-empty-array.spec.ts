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

    it('should return true if variable is a non-empty readonly array', () => {
        expect.hasAssertions();

        const readonlyArray: readonly string[] = ['a', 'b'];
        expect(isNotEmptyArray(readonlyArray)).toBe(true);
    });

    it('should preserve mutability for mutable arrays', () => {
        expect.hasAssertions();

        const array: string[] | undefined = ['a', 'b'];

        if (isNotEmptyArray(array)) {
            array.push('c');
        }

        expect(array).toEqual(['a', 'b', 'c']);
    });
});
