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

    it('should work when passed as a callback to Array.filter', () => {
        expect.hasAssertions();

        const arrays: string[][] = [['a', 'b'], [], ['c']];
        const result: string[][] = arrays.filter(isNotEmptyArray);

        expect(result).toEqual([['a', 'b'], ['c']]);
    });

    it('should work when passed as a callback to Array.filter with readonly arrays', () => {
        expect.hasAssertions();

        const arrays: ReadonlyArray<readonly string[]> = [['a', 'b'], [], ['c']];
        const result: ReadonlyArray<readonly string[]> = arrays.filter(isNotEmptyArray);

        expect(result).toEqual([['a', 'b'], ['c']]);
    });

    it('should handle any-typed values', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value: any = ['a', 'b'];

        expect(isNotEmptyArray(value)).toBe(true);
        expect(isNotEmptyArray([] as unknown[])).toBe(false);
    });
});
