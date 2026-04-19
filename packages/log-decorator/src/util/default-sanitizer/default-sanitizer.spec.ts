import { describe, expect, it } from '@jest/globals';

import { defaultSanitizer } from '../../default-sanitizer';

describe('defaultSanitizer', () => {
    it('passes through null', () => {
        expect(defaultSanitizer(null)).toBeNull();
    });

    it('passes through undefined', () => {
        expect(defaultSanitizer(undefined)).toBeUndefined();
    });

    it('passes through numbers', () => {
        const pi = 3.14;
        expect(defaultSanitizer(42)).toBe(42);
        expect(defaultSanitizer(pi)).toBe(pi);
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

    it('sanitizes elements of short arrays (truncates long strings inside arrays)', () => {
        const arr = ['short', 'x'.repeat(201)];
        expect(defaultSanitizer(arr)).toEqual(['short', '<truncated:201>']);
    });

    it('sanitizes nested objects inside arrays', () => {
        const arr = [{ msg: 'y'.repeat(201) }, { msg: 'ok' }];
        expect(defaultSanitizer(arr)).toEqual([{ msg: '<truncated:201>' }, { msg: 'ok' }]);
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

    it('handles circular references inside arrays', () => {
        const arr: unknown[] = [1];
        arr.push(arr);
        const result = defaultSanitizer(arr) as unknown[];
        expect(result[0]).toBe(1);
        expect(result[1]).toBe('[Circular]');
    });

    it('preserves shared (non-cyclic) references without false-positive [Circular]', () => {
        const shared = { x: 1 };
        const root = { a: shared, b: shared };
        expect(defaultSanitizer(root)).toEqual({ a: { x: 1 }, b: { x: 1 } });
    });

    it('handles functions by treating them as objects (shallow copy of own keys)', () => {
        const fn = (): void => void 0;
        const result = defaultSanitizer(fn);
        expect(typeof result).toBe('object');
    });

    it('preserves Error instances as { name, message, stack } (message is non-enumerable)', () => {
        const err = new Error('something broke');
        const result = defaultSanitizer(err) as { name: string; message: string; stack?: string };
        expect(result.name).toBe('Error');
        expect(result.message).toBe('something broke');
        expect(typeof result.stack).toBe('string');
    });

    it('truncates long Error messages and stacks', () => {
        const err = new Error('m'.repeat(201));
        err.stack = 's'.repeat(250);
        const result = defaultSanitizer(err) as { message: string; stack?: string };
        expect(result.message).toBe('<truncated:201>');
        expect(result.stack).toBe('<truncated:250>');
    });

    it('omits stack for Error instances that have no stack string', () => {
        const err = new Error('no-stack');
        (err as { stack?: string }).stack = undefined;
        const result = defaultSanitizer(err) as { name: string; message: string; stack?: string };
        expect(result.message).toBe('no-stack');
        expect(result.stack).toBeUndefined();
    });

    it('renders Date as ISO string', () => {
        const d = new Date('2025-01-02T03:04:05.678Z');
        expect(defaultSanitizer(d)).toBe('2025-01-02T03:04:05.678Z');
    });

    it('renders invalid Date as [Invalid Date] instead of throwing RangeError', () => {
        expect(defaultSanitizer(new Date('not-a-real-date'))).toBe('[Invalid Date]');
    });

    it('renders RegExp as its string form', () => {
        expect(defaultSanitizer(/foo/gi)).toBe('/foo/gi');
    });

    it('summarizes Map and Set by size instead of losing content', () => {
        const m = new Map<string, number>([['a', 1], ['b', 2]]);
        expect(defaultSanitizer(m)).toEqual({ _type: 'Map', size: 2 });

        const s = new Set<number>([1, 2, 3]);
        expect(defaultSanitizer(s)).toEqual({ _type: 'Set', size: 3 });
    });
});
