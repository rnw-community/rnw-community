import { describe, expect, it } from '@jest/globals';

import { resolveLockKey } from './resolve-lock-key';

describe('resolveLockKey', () => {
    it('returns static string as-is', () => {
        expect(resolveLockKey('my-key', [])).toEqual({ key: 'my-key' });
    });

    it('calls function with args', () => {
        const result = resolveLockKey((args: readonly [string]) => args[0], ['hello'] as const);
        expect(result).toEqual({ key: 'hello' });
    });

    it('handles object with static key', () => {
        expect(resolveLockKey({ key: 'static' }, [])).toEqual({ key: 'static' });
    });

    it('handles object with function key', () => {
        const result = resolveLockKey({ key: (args: readonly [number]) => `item-${args[0]}` }, [42] as const);
        expect(result).toEqual({ key: 'item-42' });
    });

    it('handles object with timeoutMs', () => {
        const result = resolveLockKey({ key: 'k', timeoutMs: 1000 }, []);
        expect(result).toEqual({ key: 'k', timeoutMs: 1000 });
    });

    it('handles object without timeoutMs', () => {
        const result = resolveLockKey({ key: 'k' }, []);
        expect(result.timeoutMs).toBeUndefined();
    });
});
