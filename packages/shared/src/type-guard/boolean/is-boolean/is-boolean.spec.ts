import { describe, expect, it } from '@jest/globals';

import { isBoolean } from './is-boolean';

import type { IsNever } from '../../array/is-never.spec-type';

describe('isBoolean', () => {
    it('should return true if variable is a boolean', () => {
        expect.hasAssertions();
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
    });

    it('should return false if variable is not a boolean', () => {
        expect.hasAssertions();

        expect(isBoolean(null)).toBe(false);
        expect(isBoolean(undefined)).toBe(false);
        expect(isBoolean({})).toBe(false);
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean('true')).toBe(false);
        expect(isBoolean(0)).toBe(false);
    });

    it('should handle any-typed values', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value: any = true;

        expect(isBoolean(value)).toBe(true);
    });

    it('should narrow unknown-typed values', () => {
        expect.hasAssertions();

        const value: unknown = false;

        expect(isBoolean(value)).toBe(true);
    });

    it('should not narrow any-typed value to never in false branch', () => {
        expect.hasAssertions();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getValue = (): any => 'not a boolean';
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = getValue();

        if (isBoolean(value)) {
            return;
        }

        // Simple `unknown` parameter does not narrow `any` to `never` in false branch
        const neverCheck: IsNever<typeof value> = false;
        expect(neverCheck).toBe(false);
    });
});
