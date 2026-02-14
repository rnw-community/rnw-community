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

    it('should return true if variable is an empty readonly array', () => {
        expect.hasAssertions();

        const readonlyArray: readonly string[] = [];
        expect(isEmptyArray(readonlyArray)).toBe(true);
    });

    it('should preserve mutability for mutable arrays', () => {
        expect.hasAssertions();

        const array: string[] | undefined = [];
        let mutable: never[] = [];

        if (isEmptyArray(array)) {
            mutable = array;
        }

        expect(mutable).toEqual([]);
    });
});
