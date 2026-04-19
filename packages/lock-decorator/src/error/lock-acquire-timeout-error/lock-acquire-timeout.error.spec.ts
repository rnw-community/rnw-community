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
});
