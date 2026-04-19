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
});
