import { describe, expect, it, jest } from '@jest/globals';

import { promiseStrategy } from './promise.strategy';

describe('promiseStrategy', () => {
    it('matches Promises and thenables', () => {
        expect(promiseStrategy.matches(Promise.resolve(1))).toBe(true);
        expect(promiseStrategy.matches({ then: () => undefined })).toBe(true);
    });

    it('rejects non-thenables', () => {
        expect(promiseStrategy.matches(null)).toBe(false);
        expect(promiseStrategy.matches(undefined)).toBe(false);
        expect(promiseStrategy.matches(42)).toBe(false);
        expect(promiseStrategy.matches({})).toBe(false);
        expect(promiseStrategy.matches({ then: 'not-a-fn' })).toBe(false);
    });

    it('invokes onSuccess with resolved value and returns a forwarded Promise', async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const out = promiseStrategy.handle(Promise.resolve('ok'), onSuccess, onError);
        await expect(out as unknown as Promise<unknown>).resolves.toBe('ok');
        expect(onSuccess).toHaveBeenCalledWith('ok');
        expect(onError).not.toHaveBeenCalled();
    });

    it('invokes onError with rejection reason and rethrows', async () => {
        const onSuccess = jest.fn();
        const onError = jest.fn();
        const boom = new Error('boom');
        const out = promiseStrategy.handle(Promise.reject(boom), onSuccess, onError);
        await expect(out as unknown as Promise<unknown>).rejects.toBe(boom);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(boom);
    });
});
