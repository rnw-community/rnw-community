import { describe, expect, it, jest } from '@jest/globals';
import { of } from 'rxjs';

import { syncStrategy } from './sync.strategy';

describe('syncStrategy', () => {
    describe('matches', () => {
        it('returns true for every value — catch-all by design', () => {
            expect.hasAssertions();
            expect(syncStrategy.matches(42)).toBe(true);
            expect(syncStrategy.matches('string')).toBe(true);
            expect(syncStrategy.matches(true)).toBe(true);
            expect(syncStrategy.matches(null)).toBe(true);
            expect(syncStrategy.matches(void 0)).toBe(true);
            expect(syncStrategy.matches({})).toBe(true);
            expect(syncStrategy.matches([])).toBe(true);
            expect(syncStrategy.matches(Number.NaN)).toBe(true);
            expect(syncStrategy.matches(Promise.resolve(1))).toBe(true);
            expect(syncStrategy.matches(of(1))).toBe(true);
        });
    });

    describe('handle', () => {
        it('returns the value untouched and calls onSuccess exactly once with the same value', () => {
            expect.hasAssertions();
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const value = { readonly: 'object' };

            const result = syncStrategy.handle(value, onSuccess, onError);

            expect(result).toBe(value);
            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith(value);
            expect(onError).not.toHaveBeenCalled();
        });

        it('passes through primitive values without conversion', () => {
            expect.hasAssertions();
            const onSuccess = jest.fn();
            const onError = jest.fn();

            expect(syncStrategy.handle(42, onSuccess, onError)).toBe(42);
            expect(syncStrategy.handle('abc', onSuccess, onError)).toBe('abc');
            expect(syncStrategy.handle(null, onSuccess, onError)).toBe(null);
            expect(syncStrategy.handle({ readonly: 'marker' }, onSuccess, onError)).toStrictEqual({ readonly: 'marker' });

            expect(onSuccess).toHaveBeenCalledTimes(4);
            expect(onError).not.toHaveBeenCalled();
        });

        it('never calls onError', () => {
            expect.hasAssertions();
            const onSuccess = jest.fn();
            const onError = jest.fn();

            syncStrategy.handle(new Error('not actually thrown'), onSuccess, onError);

            expect(onError).not.toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalledTimes(1);
        });
    });
});
