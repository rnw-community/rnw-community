import { describe, expect, it } from '@jest/globals';

import { isNotEmptyArray } from './is-not-empty-array';

import type { IsNever } from '../is-never.spec-type';

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

    it('should not narrow any-typed value to never in false branch', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getValue = (): any => 'not an array';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = getValue();

        if (isNotEmptyArray(value)) {
            return;
        }

        // @ts-expect-error FIXME: custom type guard false branch on any narrows to never
        const neverCheck: IsNever<typeof value> = false;
        expect(neverCheck).toBe(false);
    });

    it('should accept generic indexed access types like T[keyof T]', () => {
        expect.hasAssertions();

        class AssetDto {
            url = '';
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
        const handleFields = <T extends object>(data: T): string | undefined => {
            const entries = Object.entries(data) as [keyof T, T[keyof T]][];

            for (const [, value] of entries) {
                if (isNotEmptyArray(value) && value[0] instanceof AssetDto) {
                    return value[0].url;
                }
            }

            return undefined;
        };

        expect(handleFields({ assets: [new AssetDto()] })).toBe('');
    });

    it('should preserve element types after narrowing for indexed access', () => {
        expect.hasAssertions();

        interface TestItem {
            id: number;
            name: string;
        }

        const items: TestItem[] | undefined = [{ id: 1, name: 'test' }];
        // satisfies TestItem fails at compile-time if element type becomes unknown
        const first = isNotEmptyArray(items) ? (items[0] satisfies TestItem) : undefined;

        expect(first).toEqual({ id: 1, name: 'test' });
    });

    it('should preserve element types for array | undefined unions', () => {
        expect.hasAssertions();

        interface AssetCategory {
            name: string;
        }

        // Simulate: value comes from a function return, preventing const narrowing
        const getAssetCategory = (): AssetCategory[] | undefined => [{ name: 'test' }];
        const assetCategory = getAssetCategory();

        // Client pattern: isNotEmptyArray(x) && x[0].prop — element must not be unknown
        const hasName = isNotEmptyArray(assetCategory) && 'name' in assetCategory[0];

        expect(hasName).toBe(true);
    });
});
