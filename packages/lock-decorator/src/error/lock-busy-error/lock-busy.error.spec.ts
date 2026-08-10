import { describe, expect, it } from '@jest/globals';

import { LockBusyError } from './lock-busy.error';

describe('LockBusyError', () => {
    it('sets key and name', () => {
        const err = new LockBusyError('my-key');
        expect(err.key).toBe('my-key');
        expect(err.name).toBe('LockBusyError');
        expect(err.message).toContain('my-key');
        expect(err).toBeInstanceOf(Error);
    });

    it('has undefined cause by default', () => {
        expect.hasAssertions();
        const err = new LockBusyError('k');
        expect(err.cause).toBeUndefined();
    });

    it('forwards cause via options', () => {
        expect.hasAssertions();
        const underlying = new Error('redis connection lost');
        const err = new LockBusyError('k', { cause: underlying });
        expect(err.cause).toBe(underlying);
    });

    it('accepts non-Error cause values', () => {
        expect.hasAssertions();
        const err = new LockBusyError('k', { cause: 'string reason' });
        expect(err.cause).toBe('string reason');
    });
});
