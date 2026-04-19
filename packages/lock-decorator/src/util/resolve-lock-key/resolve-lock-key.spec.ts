import { describe, expect, it } from '@jest/globals';

import { resolveExclusiveLockKey, resolveSequentialLockKey } from './resolve-lock-key';

describe('resolveSequentialLockKey', () => {
    it('returns static string as-is', () => {
        expect(resolveSequentialLockKey('my-key', [])).toEqual({ key: 'my-key', options: {} });
    });

    it('calls function with args', () => {
        const result = resolveSequentialLockKey((args: readonly [string]) => args[0], ['hello'] as const);
        expect(result).toEqual({ key: 'hello', options: {} });
    });

    it('handles object with static key', () => {
        expect(resolveSequentialLockKey({ key: 'static' }, [])).toEqual({ key: 'static', options: {} });
    });

    it('handles object with function key', () => {
        const result = resolveSequentialLockKey(
            { key: (args: readonly [number]) => `item-${args[0]}` },
            [42] as const
        );
        expect(result).toEqual({ key: 'item-42', options: {} });
    });

    it('handles object with timeoutMs', () => {
        const result = resolveSequentialLockKey({ key: 'k', timeoutMs: 1000 }, []);
        expect(result).toEqual({ key: 'k', options: { timeoutMs: 1000 } });
    });

    it('handles object without timeoutMs', () => {
        const result = resolveSequentialLockKey({ key: 'k' }, []);
        expect(result.options.timeoutMs).toBeUndefined();
    });

    it('handles object with signal', () => {
        const controller = new AbortController();
        const result = resolveSequentialLockKey({ key: 'k', signal: controller.signal }, []);
        expect(result.options.signal).toBe(controller.signal);
    });

    it('handles object with both timeoutMs and signal', () => {
        const controller = new AbortController();
        const result = resolveSequentialLockKey({ key: 'k', timeoutMs: 500, signal: controller.signal }, []);
        expect(result.options.timeoutMs).toBe(500);
        expect(result.options.signal).toBe(controller.signal);
    });
});

describe('resolveExclusiveLockKey', () => {
    it('returns static string as-is', () => {
        expect(resolveExclusiveLockKey('my-key', [])).toEqual({ key: 'my-key', options: {} });
    });

    it('calls function with args', () => {
        const result = resolveExclusiveLockKey((args: readonly [string]) => args[0], ['hello'] as const);
        expect(result).toEqual({ key: 'hello', options: {} });
    });

    it('handles object with static key', () => {
        expect(resolveExclusiveLockKey({ key: 'static' }, [])).toEqual({ key: 'static', options: {} });
    });

    it('handles object with function key', () => {
        const result = resolveExclusiveLockKey(
            { key: (args: readonly [number]) => `item-${args[0]}` },
            [42] as const
        );
        expect(result).toEqual({ key: 'item-42', options: {} });
    });
});
