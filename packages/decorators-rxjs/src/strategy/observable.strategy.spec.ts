import { describe, expect, it, jest } from '@jest/globals';
import { Observable, of, throwError } from 'rxjs';

import { observableStrategy } from './observable.strategy';

describe('observableStrategy', () => {
    describe('matches', () => {
        it('returns true for an Observable', () => {
            expect(observableStrategy.matches(of(1))).toBe(true);
        });

        it('returns true for a custom Observable instance', () => {
            expect(observableStrategy.matches(new Observable())).toBe(true);
        });

        it('returns false for a number', () => {
            expect(observableStrategy.matches(42)).toBe(false);
        });

        it('returns false for a string', () => {
            expect(observableStrategy.matches('hello')).toBe(false);
        });

        it('returns false for null', () => {
            expect(observableStrategy.matches(null)).toBe(false);
        });

        it('returns false for undefined', () => {
            expect(observableStrategy.matches(undefined)).toBe(false);
        });

        it('returns false for a plain object', () => {
            expect(observableStrategy.matches({ subscribe: () => undefined })).toBe(false);
        });

        it('returns false for a Promise', () => {
            expect(observableStrategy.matches(Promise.resolve(1))).toBe(false);
        });
    });

    describe('handle', () => {
        it('calls onSuccess for each emitted value and forwards values through the returned Observable', done => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const source$ = of(1, 2, 3);
            const result = observableStrategy.handle(source$, onSuccess, onError);
            const collected: unknown[] = [];

            (result as unknown as Observable<unknown>).subscribe({
                next: v => {
                    collected.push(v);
                },
                error: done,
                complete: () => {
                    expect(onSuccess).toHaveBeenCalledTimes(3);
                    expect(onSuccess).toHaveBeenNthCalledWith(1, 1);
                    expect(onSuccess).toHaveBeenNthCalledWith(2, 2);
                    expect(onSuccess).toHaveBeenNthCalledWith(3, 3);
                    expect(collected).toEqual([1, 2, 3]);
                    expect(onError).not.toHaveBeenCalled();
                    done();
                },
            });
        });

        it('calls onError with the error and rethrows it via throwError', done => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const boom = new Error('boom');
            const source$ = throwError(() => boom);
            const result = observableStrategy.handle(source$, onSuccess, onError);

            (result as unknown as Observable<unknown>).subscribe({
                next: () => {
                    done(new Error('Should not emit a value'));
                },
                error: (err: unknown) => {
                    expect(err).toBe(boom);
                    expect(onError).toHaveBeenCalledWith(boom);
                    expect(onSuccess).not.toHaveBeenCalled();
                    done();
                },
            });
        });
    });
});
