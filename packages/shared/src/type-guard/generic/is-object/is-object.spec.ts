import { describe, expect, it } from '@jest/globals';

import { isObject as publicIsObject } from '../../../index';

import { isObject } from './is-object';

describe('isObject', () => {
    it('should return true if variable is object', () => {
        expect.hasAssertions();
        expect(isObject({})).toBe(true);
    });

    it('should return false if variable is not an object', () => {
        expect.hasAssertions();

        expect(isObject(undefined)).toBe(false);
        expect(isObject([])).toBe(false);
        expect(isObject('')).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(1 as unknown as unknown[])).toBe(false);
    });

    it('should be exported from the public package entrypoint', () => {
        expect.hasAssertions();

        const value: unknown = { key: 'value' };
        const narrowed = publicIsObject(value) ? (value satisfies object) : undefined;

        expect(narrowed).toStrictEqual({ key: 'value' });
    });
});
