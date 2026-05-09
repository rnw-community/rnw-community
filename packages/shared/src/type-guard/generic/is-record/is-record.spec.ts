import { describe, expect, it } from '@jest/globals';

import { isRecord } from './is-record';

describe('isRecord', () => {
    it('should return true if variable is a record', () => {
        expect.hasAssertions();

        expect(isRecord({})).toBe(true);
        expect(isRecord({ key: 'value' })).toBe(true);
    });

    it('should return false if variable is not a record', () => {
        expect.hasAssertions();

        expect(isRecord(undefined)).toBe(false);
        expect(isRecord('')).toBe(false);
        expect(isRecord(null)).toBe(false);
        expect(isRecord(1)).toBe(false);
        expect(isRecord(true)).toBe(false);
    });

    it('should return false if variable is an array', () => {
        expect.hasAssertions();

        expect(isRecord([])).toBe(false);
        expect(isRecord(['value'])).toBe(false);
    });

    it('should narrow values to an indexable record', () => {
        expect.hasAssertions();

        const value: unknown = { key: 'value' };
        const narrowed = isRecord(value) ? (value['key'] satisfies unknown) : undefined;

        expect(narrowed).toBe('value');
    });

});
