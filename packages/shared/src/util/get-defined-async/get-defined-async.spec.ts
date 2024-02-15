import { describe, expect, it } from '@jest/globals';

import { getDefinedAsync } from './get-defined-async';

describe('getDefinedAsync', () => {
    it('should return value if defined', async () => {
        expect.hasAssertions();
        const value = 'value';
        const result = getDefinedAsync(value, () => Promise.resolve('default'));
        await expect(result).resolves.toBe(value);
    });
    it('should return default if value is undefined', async () => {
        expect.hasAssertions();
        const defaultValue = 'default';
        const result = getDefinedAsync(undefined, () => Promise.resolve(defaultValue));
        await expect(result).resolves.toBe(defaultValue);
    });
    it('should return default if value is null', async () => {
        expect.hasAssertions();
        const defaultValue = 'default';
        const result = getDefinedAsync(null, () => Promise.resolve(defaultValue));
        await expect(result).resolves.toBe(defaultValue);
    });
    it('should return promise of default if value is undefined', async () => {
        expect.hasAssertions();
        const defaultValue = 'default';
        const result = getDefinedAsync(undefined, () => Promise.resolve(defaultValue));
        await expect(result).resolves.toBe(defaultValue);
    });
});
