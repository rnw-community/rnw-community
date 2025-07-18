/* eslint-disable jest/no-done-callback */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Redis from 'ioredis';
import { EMPTY, Observable, lastValueFrom, of, tap } from 'rxjs';

import { LockableService } from '../service/lockable.service';

import { LockObservable } from './lock-observable.decorator';

const getRedisService = (): Redis => jest.fn() as unknown as Redis;
const mockRelease = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockAcquire = jest
    .fn<(args: string[], timeout: number) => Promise<{ release: () => Promise<boolean> }>>()
    .mockResolvedValue({ release: mockRelease });

jest.mock('redlock', () =>
    jest.fn().mockImplementation(() => ({
        acquire: mockAcquire,
        release: mockRelease,
    }))
);

const mockErrorFn = jest.fn();
const mockResultFn = jest.fn();

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

    @LockObservable(['test'], 1000)
    testReleaseAfterResultFn$(): Observable<number> {
        return of(this.field).pipe(tap(() => mockResultFn()));
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

    it('should lock resource with key as array and duration', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        await expect(lastValueFrom(instance.testArray$(1))).resolves.toBe(1);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should lock resource with key as function and duration', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        await expect(lastValueFrom(instance.testFunction$(1))).resolves.toStrictEqual({ field: 1, id: 1 });
        expect(mockAcquire).toHaveBeenCalledWith([`test`, `1`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should throw error if redlock is not available', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();
        // @ts-expect-error Test preconditions
        instance.redlock = undefined;

        await expect(lastValueFrom(instance.testMissingRedlock$(1))).rejects.toThrow(
            'Redlock is not available on this instance. Ensure that the class using the `Lock` decorator extends `LockableService` or provide redlock field manually.'
        );
        expect(mockAcquire).not.toHaveBeenCalledWith(['test', '1'], 1000);
        expect(mockRelease).not.toHaveBeenCalled();
    });

    it('should throw error if resources argument is not defined or empty array is passed', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        await expect(lastValueFrom(instance.testEmptyResource$())).rejects.toThrow(`Lock key is not defined`);
        expect(mockAcquire).not.toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
    });

    it('should throw error if decorated method does not return Observable', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        // @ts-expect-error HINT: Wrong types test
        await expect(lastValueFrom(instance.testSync())).rejects.toThrow(
            `Method TestObservableClass::testSync does not return an observable`
        );
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should handle acquire lock failed', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));

        await expect(lastValueFrom(instance.testLockFailed$())).rejects.toThrow(errorMsg);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
    });

    it('should handle release lock failed', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to release lock';
        mockRelease.mockRejectedValue(new Error(errorMsg));

        await expect(lastValueFrom(instance.testLockFailed$())).resolves.toBe(1);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should handle error in catchErrorFn', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));
        mockErrorFn.mockReturnValue(EMPTY);

        await lastValueFrom(instance.testLockFailedErrorFn$());

        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
        expect(mockErrorFn).toHaveBeenCalledWith(new Error(errorMsg));
    });

    it('should handle throwing error in catchErrorFn', async () => {
        expect.assertions(3);

        const instance = new TestObservableClass();

        const errorMsg = 'Failed to acquire lock';
        mockAcquire.mockRejectedValue(new Error(errorMsg));
        const catchErrorFnErrorMsg = 'Error in catchErrorFn';
        mockErrorFn.mockImplementation(() => {
            throw new Error(catchErrorFnErrorMsg);
        });

        await expect(lastValueFrom(instance.testLockFailedErrorFn$())).rejects.toThrow(catchErrorFnErrorMsg);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
    });

    it('should wait for resultFn to complete before releasing the lock', async () => {
        expect.assertions(4);

        const instance = new TestObservableClass();

        await expect(lastValueFrom(instance.testReleaseAfterResultFn$())).resolves.toBe(1);
        expect(mockResultFn).toHaveBeenCalledWith();
        expect(mockRelease).toHaveBeenCalledWith();

        const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
        const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

        expect(resultCallOrder).toBeLessThan(releaseCallOrder);
    });
});
