import { describe, expect, it } from '@jest/globals';

import { getDefined } from './get-defined';
describe('getDefined', () => {
    it('should return value if defined', () => {
        expect.hasAssertions();
        const value = 'value';
        const result = getDefined(value, () => 'default');
        expect(result).toBe(value);
    });
    it('should return default if value is undefined', () => {
        expect.hasAssertions();
        const defaultValue = 'default';
        const result = getDefined(undefined, () => defaultValue);
        expect(result).toBe(defaultValue);
    });
    it('should return default if value is null', () => {
        expect.hasAssertions();
        const defaultValue = 'default';
        const result = getDefined(null, () => defaultValue);
        expect(result).toBe(defaultValue);
    });
});
