import { describe, expect, it, jest } from '@jest/globals';
import { EMPTY, Observable, of, throwError } from 'rxjs';

import { completionObservableStrategy } from './completion-observable.strategy';

describe('completionObservableStrategy', () => {
    describe('matches', () => {
        it('returns true for an Observable', () => {
            expect(completionObservableStrategy.matches(of(1))).toBe(true);
        });

        it('returns false for a Promise', () => {
            expect(completionObservableStrategy.matches(Promise.resolve(1))).toBe(false);
        });

        it('returns false for a primitive', () => {
            expect(completionObservableStrategy.matches(42)).toBe(false);
        });
    });

    describe('handle', () => {
        it('calls onSuccess exactly once on stream completion with the last emitted value', done => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const source$ = of(1, 2, 3);
            const result = completionObservableStrategy.handle(source$, onSuccess, onError);

            (result as unknown as Observable<unknown>).subscribe({
                error: done,
                complete: () => {
                    expect(onSuccess).toHaveBeenCalledTimes(1);
                    expect(onSuccess).toHaveBeenCalledWith(3);
                    expect(onError).not.toHaveBeenCalled();
                    done();
                },
            });
        });

        it('calls onSuccess exactly once with undefined when the stream completes without emitting', done => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const result = completionObservableStrategy.handle(EMPTY, onSuccess, onError);

            (result as unknown as Observable<unknown>).subscribe({
                error: done,
                complete: () => {
                    expect(onSuccess).toHaveBeenCalledTimes(1);
                    expect(onSuccess).toHaveBeenCalledWith(undefined);
                    expect(onError).not.toHaveBeenCalled();
                    done();
                },
            });
        });

        it('calls onError exactly once and rethrows the error through the stream', done => {
            const onSuccess = jest.fn();
            const onError = jest.fn();
            const boom = new Error('boom');
            const result = completionObservableStrategy.handle(throwError(() => boom), onSuccess, onError);

            (result as unknown as Observable<unknown>).subscribe({
                next: () => { done(new Error('should not emit')); },
                error: (err: unknown) => {
                    expect(err).toBe(boom);
                    expect(onError).toHaveBeenCalledTimes(1);
                    expect(onError).toHaveBeenCalledWith(boom);
                    expect(onSuccess).not.toHaveBeenCalled();
                    done();
                },
            });
        });

        it('forwards emitted values downstream unchanged', done => {
            const source$ = of(1, 2, 3);
            const collected: number[] = [];
            const result = completionObservableStrategy.handle(source$, jest.fn(), jest.fn());

            (result as unknown as Observable<number>).subscribe({
                next: emitted => collected.push(emitted),
                error: done,
                complete: () => {
                    expect(collected).toEqual([1, 2, 3]);
                    done();
                },
            });
        });
    });
});
