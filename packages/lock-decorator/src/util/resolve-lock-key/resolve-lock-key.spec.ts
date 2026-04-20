import { describe, expect, it } from '@jest/globals';

import { resolveLockKey } from './resolve-lock-key';

describe('resolveLockKey (sequential arg forms)', () => {
    it('returns static string as-is', () => {
        expect(resolveLockKey('my-key', [])).toEqual({ key: 'my-key', options: {} });
    });

    it('calls function with args', () => {
        const result = resolveLockKey((args: readonly [string]) => args[0], ['hello'] as const);
        expect(result).toEqual({ key: 'hello', options: {} });
    });

    it('handles object with static key', () => {
        expect(resolveLockKey({ key: 'static' }, [])).toEqual({
            key: 'static',
            options: { timeoutMs: undefined, signal: undefined },
        });
    });

    it('handles object with function key', () => {
        const result = resolveLockKey({ key: (args: readonly [number]) => `item-${args[0]}` }, [42] as const);
        expect(result).toEqual({ key: 'item-42', options: { timeoutMs: undefined, signal: undefined } });
    });

    it('handles object with timeoutMs', () => {
        const result = resolveLockKey({ key: 'k', timeoutMs: 1000 }, []);
        expect(result).toEqual({ key: 'k', options: { timeoutMs: 1000, signal: undefined } });
    });

    it('handles object without timeoutMs', () => {
        const result = resolveLockKey({ key: 'k' }, []);
        expect(result.options.timeoutMs).toBeUndefined();
    });

    it('handles object with signal', () => {
        const controller = new AbortController();
        const result = resolveLockKey({ key: 'k', signal: controller.signal }, []);
        expect(result.options.signal).toBe(controller.signal);
    });

    it('handles object with both timeoutMs and signal', () => {
        const controller = new AbortController();
        const result = resolveLockKey({ key: 'k', timeoutMs: 500, signal: controller.signal }, []);
        expect(result.options.timeoutMs).toBe(500);
        expect(result.options.signal).toBe(controller.signal);
    });
});

describe('resolveLockKey (exclusive arg forms)', () => {
    it('returns static string as-is', () => {
        expect(resolveLockKey('my-key', [])).toEqual({ key: 'my-key', options: {} });
    });

    it('calls function with args', () => {
        const result = resolveLockKey((args: readonly [string]) => args[0], ['hello'] as const);
        expect(result).toEqual({ key: 'hello', options: {} });
    });

    it('handles object with static key', () => {
        expect(resolveLockKey({ key: 'static' }, [])).toEqual({
            key: 'static',
            options: { timeoutMs: undefined, signal: undefined },
        });
    });

    it('handles object with function key', () => {
        const result = resolveLockKey(
            { key: (args: readonly [number]) => `item-${args[0]}` },
            [42] as const
        );
        expect(result).toEqual({ key: 'item-42', options: { timeoutMs: undefined, signal: undefined } });
    });
});

describe('resolveLockKey (empty-key rejection)', () => {
    it('throws when a static string key is empty', () => {
        expect(() => resolveLockKey('', [])).toThrow('Lock key cannot be empty');
    });

    it('throws when a key function returns empty', () => {
        expect(() => resolveLockKey(() => '', [])).toThrow('Lock key cannot be empty');
    });

    it('throws when an object with an empty static key is passed', () => {
        expect(() => resolveLockKey({ key: '' }, [])).toThrow('Lock key cannot be empty');
    });

    it('throws when an object with a key function returning empty is passed', () => {
        expect(() => resolveLockKey({ key: () => '' }, [])).toThrow('Lock key cannot be empty');
    });
});
