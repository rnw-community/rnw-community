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

    it('should work when passed as a callback to Array.filter', () => {
        expect.hasAssertions();

        const items: (string[] | string | undefined)[] = [['a'], 'b', undefined, ['c']];
        const result: (string[] | string | undefined)[] = items.filter(isArray);

        expect(result).toEqual([['a'], ['c']]);
    });

    it('should narrow mixed union types', () => {
        expect.hasAssertions();

        const value: string | string[] = ['a', 'b'];
        // Verifies narrowing: string | string[] -> string[] (via T & readonly unknown[])
        const narrowed = isArray(value) ? (value satisfies string[]) : undefined;

        expect(isArray(value)).toBe(true);
        expect(narrowed).toEqual(['a', 'b']);
    });
});
