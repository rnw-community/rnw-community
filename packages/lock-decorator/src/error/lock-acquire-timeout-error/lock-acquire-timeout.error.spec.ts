import { describe, expect, it } from '@jest/globals';

import { LockAcquireTimeoutError } from './lock-acquire-timeout.error';

describe('LockAcquireTimeoutError', () => {
    it('sets key, timeoutMs and name', () => {
        const err = new LockAcquireTimeoutError('k', 500);
        expect(err.key).toBe('k');
        expect(err.timeoutMs).toBe(500);
        expect(err.name).toBe('LockAcquireTimeoutError');
        expect(err.message).toContain('k');
        expect(err.message).toContain('500');
        expect(err).toBeInstanceOf(Error);
    });

    it('has undefined cause by default', () => {
        expect.hasAssertions();
        const err = new LockAcquireTimeoutError('k', 100);
        expect(err.cause).toBeUndefined();
    });

    it('forwards cause via options', () => {
        expect.hasAssertions();
        const underlying = new Error('driver timeout');
        const err = new LockAcquireTimeoutError('k', 100, { cause: underlying });
        expect(err.cause).toBe(underlying);
    });
});
