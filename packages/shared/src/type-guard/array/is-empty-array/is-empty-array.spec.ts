import { describe, expect, it } from '@jest/globals';

import { isEmptyArray } from './is-empty-array';

import type { IsNever } from '../is-never.spec-type';

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
        let mutable: string[] = ['initial'];

        if (isEmptyArray(array)) {
            mutable = array;
        }

        expect(mutable).toEqual([]);
    });

    it('should work when passed as a callback to Array.filter', () => {
        expect.hasAssertions();

        const arrays: string[][] = [['a', 'b'], [], ['c']];
        const result: string[][] = arrays.filter(isEmptyArray);

        expect(result).toEqual([[]]);
    });

    it('should work when passed as a callback to Array.filter with readonly arrays', () => {
        expect.hasAssertions();

        const arrays: ReadonlyArray<readonly string[]> = [['a', 'b'], [], ['c']];
        const result: ReadonlyArray<readonly string[]> = arrays.filter(isEmptyArray);

        expect(result).toEqual([[]]);
    });

    it('should narrow false branch to remove undefined after early return', () => {
        expect.hasAssertions();

        interface TestItem {
            id: number;
            name: string;
        }

        // Use function return to prevent const narrowing — TS can't see through function calls
        const getItems = (): TestItem[] | undefined => [{ id: 1, name: 'test' }];
        const items = getItems();

        if (isEmptyArray(items)) {
            throw new Error('Expected non-empty array');
        }

        // @ts-expect-error FIXME: isEmptyArray false branch does not remove undefined
        items.push({ id: 2, name: 'added' });
        expect(items).toHaveLength(2);
    });

    it('should not narrow any-typed value to never in false branch', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getValue = (): any => [1, 2, 3];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = getValue();

        if (isEmptyArray(value)) {
            return;
        }

        // @ts-expect-error FIXME: custom type guard false branch on any narrows to never
        const neverCheck: IsNever<typeof value> = false;
        expect(neverCheck).toBe(false);
    });
});
