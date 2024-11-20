/* eslint-disable jest/no-done-callback */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Redis from 'ioredis';
import { EMPTY, Observable, of } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { LockableService } from '../service/lockable.service';

import { LockObservable } from './lock-observable.decorator';

const getRedisService = (): Redis => jest.fn() as unknown as Redis;
const mockRelease = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockAcquire = jest
    .fn<() => Promise<{ release: () => Promise<boolean> }>>()
    .mockResolvedValue({ release: mockRelease });

jest.mock('redlock', () =>
    jest.fn().mockImplementation(() => ({
        acquire: mockAcquire,
        release: mockRelease,
    }))
);

const mockErrorFn = jest.fn();

class TestObservableClass extends LockableService {
    readonly field = 1;

    constructor() {
        super(getRedisService());
    }

    @LockObservable(['test'], 1000)
    testArray$(): Observable<number> {
        return of(this.field);
    }

    @LockObservable(id => ['test', String(id)], 1000)
    testFunction$(id: number): Observable<{ field: number; id: number }> {
        return of({ field: this.field, id });
    }

    @LockObservable(id => ['test', String(id)], 1000)
    testMissingRedlock$(id: number): Observable<number[]> {
        return of([this.field, id]);
    }

    @LockObservable(['test'], 1000)
    testSync(): number {
        return this.field;
    }

    @LockObservable([], 1000)
    testEmptyResource$(): Observable<number> {
        return of(this.field);
    }

    @LockObservable(['test'], 1000)
    testLockFailed$(): Observable<number> {
        return of(this.field);
    }

    @LockObservable(['test'], 1000, err => {
        mockErrorFn(err);

        return of(0);
    })
    testLockFailedErrorFn$(): Observable<number> {
        return of(this.field);
    }
}

// eslint-disable-next-line max-lines-per-function
describe('LockObservableDecorator', () => {
    // eslint-disable-next-line jest/no-hooks
    beforeEach(() => {
        jest.clearAllMocks();
        mockRelease.mockResolvedValue(true);
        mockAcquire.mockResolvedValue({ release: mockRelease });
    });

    it('should lock resource with key as array and duration', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        instance.testArray$().subscribe({
            next: value => {
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(value).toBe(1);
                expect(mockRelease).toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should lock resource with key as function and duration', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        instance.testFunction$(1).subscribe({
            next: value => {
                expect(mockAcquire).toHaveBeenCalledWith([`test`, `1`], 1000);
                expect(value).toStrictEqual({ field: 1, id: 1 });
                expect(mockRelease).toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should throw error if redlock is not available', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();
        // @ts-expect-error Test preconditions
        instance.redlock = undefined;

        instance.testMissingRedlock$(1).subscribe({
            error: (error: unknown) => {
                expect(getErrorMessage(error)).toBe(
                    'Redlock is not available on this instance. Ensure that the class using the `Lock` decorator extends `LockableService` or provide redlock field manually.'
                );
                expect(mockAcquire).not.toHaveBeenCalledWith([`test`, `1`], 1000);
                expect(mockRelease).not.toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should throw error if resources argument is not defined or empty array is passed', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        instance.testEmptyResource$().subscribe({
            error: (error: unknown) => {
                expect(getErrorMessage(error)).toBe(`Lock key is not defined`);
                expect(mockAcquire).not.toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).not.toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should throw error if decorated method does not return Observable', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        // HINT: Wrong types test
        (instance.testSync() as unknown as Observable<number>).subscribe({
            error: (error: unknown) => {
                expect(getErrorMessage(error)).toBe(`Method TestObservableClass::testSync does not return an observable`);
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should handle acquire lock failed', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));

        instance.testLockFailed$().subscribe({
            error: (error: unknown) => {
                expect(getErrorMessage(error)).toBe(errorMsg);
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).not.toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should handle release lock failed', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to release lock';
        mockRelease.mockRejectedValue(new Error(errorMsg));

        instance.testLockFailed$().subscribe({
            next: value => {
                expect(value).toBe(1);
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).toHaveBeenCalledWith();

                done();
            },
        });
    });

    it('should handle error in catchErrorFn', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));
        mockErrorFn.mockReturnValue(EMPTY);

        instance.testLockFailedErrorFn$().subscribe({
            complete: () => {
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).not.toHaveBeenCalledWith();
                expect(mockErrorFn).toHaveBeenCalledWith(new Error(errorMsg));

                done();
            },
        });
    });

    it('should handle throwing error in catchErrorFn', done => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));
        const catchErrorFnErrorMsg = 'Error in catchErrorFn';
        mockErrorFn.mockImplementation(() => {
            throw new Error(catchErrorFnErrorMsg);
        });

        instance.testLockFailedErrorFn$().subscribe({
            error: (error: unknown) => {
                expect(getErrorMessage(error)).toBe(catchErrorFnErrorMsg);
                expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
                expect(mockRelease).not.toHaveBeenCalledWith();

                done();
            },
        });
    });
});
