import { describe, expect, it } from '@jest/globals';

import { isPositiveNumber } from '../../number/is-positive-number/is-positive-number';
import { isNotEmptyString } from '../../string/is-not-empty-string/is-not-empty-string';

import { isNotEmptyArrayOf } from './is-not-empty-array-of';

import type { IsNever } from '../is-never.spec-type';

describe('isNotEmptyArrayOf', () => {
    it('should return true for non-empty array where all elements match guard', () => {
        expect.hasAssertions();

        expect(isNotEmptyArrayOf(['a', 'b'], isNotEmptyString)).toBe(true);
    });

    it('should return false for empty array', () => {
        expect.hasAssertions();

        expect(isNotEmptyArrayOf([], isNotEmptyString)).toBe(false);
    });

    it('should return false for non-array values', () => {
        expect.hasAssertions();

        expect(isNotEmptyArrayOf(undefined, isNotEmptyString)).toBe(false);
        expect(isNotEmptyArrayOf(1, isNotEmptyString)).toBe(false);
        expect(isNotEmptyArrayOf('string', isNotEmptyString)).toBe(false);
    });

    it('should return false when some elements do not match guard', () => {
        expect.hasAssertions();

        expect(isNotEmptyArrayOf(['a', '', 'b'], isNotEmptyString)).toBe(false);
        expect(isNotEmptyArrayOf([1, -1, 2], isPositiveNumber)).toBe(false);
    });

    it('should narrow element types with isNotEmptyString', () => {
        expect.hasAssertions();

        const values: (string | number)[] | undefined = ['a', 'b'];
        // satisfies string fails at compile-time if element type is not narrowed
        const first = isNotEmptyArrayOf(values, isNotEmptyString) ? (values[0] satisfies string) : undefined;

        expect(first).toBe('a');
    });

    it('should narrow element types with isPositiveNumber', () => {
        expect.hasAssertions();

        const values: (string | number)[] = [1, 2, 3];
        // satisfies number fails at compile-time if element type is not narrowed
        const first = isNotEmptyArrayOf(values, isPositiveNumber) ? (values[0] satisfies number) : undefined;

        expect(first).toBe(1);
    });

    it('should work with custom type guard functions', () => {
        expect.hasAssertions();

        interface User {
            name: string;
        }

        const isUser = (value: unknown): value is User =>
            typeof value === 'object' && value !== null && 'name' in value;

        const users: unknown[] = [{ name: 'Alice' }, { name: 'Bob' }];
        // satisfies User fails at compile-time if element type is not narrowed
        const first = isNotEmptyArrayOf(users, isUser) ? (users[0] satisfies User) : undefined;

        expect(first).toEqual({ name: 'Alice' });
    });

    it('should work with readonly arrays', () => {
        expect.hasAssertions();

        const readonlyArray: readonly string[] = ['a', 'b'];

        expect(isNotEmptyArrayOf(readonlyArray, isNotEmptyString)).toBe(true);
    });

    it('should preserve element types for array | undefined unions', () => {
        expect.hasAssertions();

        const getValues = (): string[] | undefined => ['a', 'b'];
        const values = getValues();
        // satisfies string fails at compile-time if element type is not narrowed
        const first = isNotEmptyArrayOf(values, isNotEmptyString) ? (values[0] satisfies string) : undefined;

        expect(first).toBe('a');
    });

    it('should handle any-typed values', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value: any = ['a', 'b'];

        expect(isNotEmptyArrayOf(value, isNotEmptyString)).toBe(true);
        expect(isNotEmptyArrayOf([], isNotEmptyString)).toBe(false);
    });

    it('should not narrow any-typed value to never in false branch', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getValue = (): any => 'not an array';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = getValue();

        if (isNotEmptyArrayOf(value, isNotEmptyString)) {
            return;
        }

        // @ts-expect-error FIXME: custom type guard false branch on any narrows to never
        const neverCheck: IsNever<typeof value> = false;
        expect(neverCheck).toBe(false);
    });

    it('should accept generic indexed access types like T[keyof T]', () => {
        expect.hasAssertions();

        const isStringGuard = (value: unknown): value is string => typeof value === 'string';

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
        const handleFields = <T extends object>(data: T): string | undefined => {
            const entries = Object.entries(data) as [keyof T, T[keyof T]][];

            for (const [, value] of entries) {
                if (isNotEmptyArrayOf(value, isStringGuard)) {
                    return value[0];
                }
            }

            return undefined;
        };

        expect(handleFields({ tags: ['a', 'b'] })).toBe('a');
    });

    it('should preserve element types after narrowing for indexed access', () => {
        expect.hasAssertions();

        interface TestItem {
            id: number;
            name: string;
        }

        const isTestItem = (value: unknown): value is TestItem =>
            typeof value === 'object' && value !== null && 'id' in value && 'name' in value;

        const items: TestItem[] | undefined = [{ id: 1, name: 'test' }];
        // satisfies TestItem fails at compile-time if element type becomes unknown
        const first = isNotEmptyArrayOf(items, isTestItem) ? (items[0] satisfies TestItem) : undefined;

        expect(first).toEqual({ id: 1, name: 'test' });
    });
});
