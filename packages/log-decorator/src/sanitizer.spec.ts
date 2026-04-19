import { describe, expect, it } from '@jest/globals';

import { defaultSanitizer } from './sanitizer';

describe('defaultSanitizer', () => {
    it('passes through null', () => {
        expect(defaultSanitizer(null)).toBeNull();
    });

    it('passes through undefined', () => {
        expect(defaultSanitizer(undefined)).toBeUndefined();
    });

    it('passes through numbers', () => {
        expect(defaultSanitizer(42)).toBe(42);
        expect(defaultSanitizer(3.14)).toBe(3.14);
    });

    it('passes through booleans', () => {
        expect(defaultSanitizer(true)).toBe(true);
        expect(defaultSanitizer(false)).toBe(false);
    });

    it('passes through short strings as-is', () => {
        expect(defaultSanitizer('hello')).toBe('hello');
        expect(defaultSanitizer('')).toBe('');
    });

    it('truncates strings longer than 200 characters', () => {
        const longStr = 'a'.repeat(201);
        expect(defaultSanitizer(longStr)).toBe('<truncated:201>');
    });

    it('passes through strings exactly 200 chars', () => {
        const str = 'a'.repeat(200);
        expect(defaultSanitizer(str)).toBe(str);
    });

    it('passes through arrays with <= 20 elements', () => {
        const arr = [1, 2, 3];
        expect(defaultSanitizer(arr)).toEqual([1, 2, 3]);
    });

    it('replaces arrays with length > 20 with { length } object', () => {
        const arr = new Array(21).fill(0) as unknown[];
        expect(defaultSanitizer(arr)).toEqual({ length: 21 });
    });

    it('shallow-copies objects and sanitizes values', () => {
        const obj = { name: 'test', value: 123 };
        expect(defaultSanitizer(obj)).toEqual({ name: 'test', value: 123 });
    });

    it('recursively sanitizes nested object string values', () => {
        const obj = { nested: { longStr: 'x'.repeat(201) } };
        expect(defaultSanitizer(obj)).toEqual({ nested: { longStr: '<truncated:201>' } });
    });

    it('handles circular references safely', () => {
        const obj: Record<string, unknown> = { name: 'root' };
        obj['self'] = obj;
        const result = defaultSanitizer(obj) as Record<string, unknown>;
        expect(result['name']).toBe('root');
        expect(result['self']).toBe('[Circular]');
    });

    it('handles functions by treating them as objects (shallow copy)', () => {
        const fn = (): void => void 0;
        const result = defaultSanitizer(fn);
        expect(typeof result).toBe('object');
    });
});
