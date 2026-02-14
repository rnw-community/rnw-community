import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { EMPTY, Observable, lastValueFrom, of, tap } from 'rxjs';

import { createObservableLockDecorators } from './create-observable-lock-decorators';

import type { LockHandle } from '../interface/lock-handle.interface';
import type { LockServiceInterface } from '../interface/lock-service.interface';


const mockRelease = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockAcquire = jest
    .fn<(resources: string[], duration: number) => Promise<LockHandle>>()
    .mockResolvedValue({ release: mockRelease });
const mockTryAcquire = jest
    .fn<(resources: string[], duration: number) => Promise<LockHandle | undefined>>()
    .mockResolvedValue({ release: mockRelease });

let injectedSymbol: symbol;

jest.mock('@nestjs/common', () => ({
    Inject: () => (_target: object, key: symbol) => {
        injectedSymbol = key;
    },
}));

const mockErrorFn = jest.fn();
const mockResultFn = jest.fn();

abstract class MockLockService implements LockServiceInterface {
    abstract acquire(resources: string[], duration: number): Promise<LockHandle>;
    abstract tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined>;
}

const { SequentialLock$, ExclusiveLock$ } = createObservableLockDecorators(MockLockService, 1000);

class TestClass {
    readonly field = 1;

    @SequentialLock$(['test'])
    testArray$(): Observable<number> {
        return of(this.field);
    }

    @SequentialLock$(id => ['test', String(id)])
    testFunction$(id: number): Observable<{ field: number; id: number }> {
        return of({ field: this.field, id });
    }

    @SequentialLock$(['test'])
    testSync(): number {
        return this.field;
    }

    @SequentialLock$([])
    testEmptyResource$(): Observable<number> {
        return of(this.field);
    }

    @SequentialLock$(['test'])
    testLockFailed$(): Observable<number> {
        return of(this.field);
    }

    @SequentialLock$(['test'], err => {
        mockErrorFn(err);

        return of(0);
    })
    testLockFailedErrorFn$(): Observable<number> {
        return of(this.field);
    }

    @SequentialLock$(['test'])
    testReleaseAfterResultFn$(): Observable<number> {
        return of(this.field).pipe(tap(() => mockResultFn()));
    }

    @SequentialLock$(['test'], undefined, 5000)
    testOverrideDuration$(): Observable<number> {
        return of(this.field);
    }

    @ExclusiveLock$(['test'])
    testExclusiveArray$(): Observable<number> {
        return of(this.field);
    }

    @ExclusiveLock$(id => ['test', String(id)])
    testExclusiveFunction$(id: number): Observable<{ field: number; id: number }> {
        return of({ field: this.field, id });
    }

    @ExclusiveLock$(['test'])
    testExclusiveSync(): number {
        return this.field;
    }

    @ExclusiveLock$([])
    testExclusiveEmptyResource$(): Observable<number> {
        return of(this.field);
    }

    @ExclusiveLock$(['test'])
    testExclusiveLockFailed$(): Observable<number> {
        return of(this.field);
    }

    @ExclusiveLock$(['test'], err => {
        mockErrorFn(err);

        return of(0);
    })
    testExclusiveLockFailedErrorFn$(): Observable<number> {
        return of(this.field);
    }

    @ExclusiveLock$(['test'])
    testExclusiveReleaseAfterResultFn$(): Observable<number> {
        return of(this.field).pipe(tap(() => mockResultFn()));
    }

    @ExclusiveLock$(['test'], undefined, 5000)
    testExclusiveOverrideDuration$(): Observable<number> {
        return of(this.field);
    }
}

const getMockLockService = (): LockServiceInterface => ({ acquire: mockAcquire, tryAcquire: mockTryAcquire });

describe('createObservableLockDecorators', () => {
    let instance: TestClass;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRelease.mockResolvedValue(true);
        mockAcquire.mockResolvedValue({ release: mockRelease });
        mockTryAcquire.mockResolvedValue({ release: mockRelease });
        instance = new TestClass();
        // HINT: Simulate NestJS DI by setting the lock service on the instance via the captured symbol
        (instance as unknown as Record<symbol, unknown>)[injectedSymbol] = getMockLockService();
    });

    describe('SequentialLock$', () => {
        it('should lock resource with key as array and duration', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testArray$())).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should lock resource with key as function and duration', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testFunction$(1))).resolves.toStrictEqual({ field: 1, id: 1 });
            expect(mockAcquire).toHaveBeenCalledWith(['test', '1'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should throw error if resources argument is not defined or empty array is passed', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testEmptyResource$())).rejects.toThrow('Lock key is not defined');
            expect(mockAcquire).not.toHaveBeenCalled();
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if decorated method does not return observable', async () => {
            expect.hasAssertions();

            // @ts-expect-error HINT: Wrong types test
            await expect(lastValueFrom(instance.testSync())).rejects.toThrow(
                'Method TestClass::testSync does not return an observable'
            );
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle acquire lock failed', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockAcquire.mockRejectedValue(new Error(errorMsg));

            await expect(lastValueFrom(instance.testLockFailed$())).rejects.toThrow(errorMsg);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle release lock failed', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to release lock';
            mockRelease.mockRejectedValue(new Error(errorMsg));

            await expect(lastValueFrom(instance.testLockFailed$())).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockAcquire.mockRejectedValue(new Error(errorMsg));
            mockErrorFn.mockReturnValue(EMPTY);

            await lastValueFrom(instance.testLockFailedErrorFn$());

            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
            expect(mockErrorFn).toHaveBeenCalledWith(new Error(errorMsg));
        });

        it('should handle throwing error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockAcquire.mockRejectedValue(new Error(errorMsg));
            const catchErrorFnErrorMsg = 'Error in catchErrorFn';
            mockErrorFn.mockImplementation(() => {
                throw new Error(catchErrorFnErrorMsg);
            });

            await expect(lastValueFrom(instance.testLockFailedErrorFn$())).rejects.toThrow(catchErrorFnErrorMsg);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should use overridden duration when provided', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testOverrideDuration$())).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 5000);
        });

        it('should release lock after result function', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testReleaseAfterResultFn$())).resolves.toBe(1);
            expect(mockResultFn).toHaveBeenCalledWith();
            expect(mockRelease).toHaveBeenCalledWith();

            const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
            const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

            expect(resultCallOrder).toBeLessThan(releaseCallOrder);
        });
    });

    describe('ExclusiveLock$', () => {
        it('should lock resource with key as array and duration', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testExclusiveArray$())).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should lock resource with key as function and duration', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testExclusiveFunction$(1))).resolves.toStrictEqual({
                field: 1,
                id: 1,
            });
            expect(mockTryAcquire).toHaveBeenCalledWith(['test', '1'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should complete with EMPTY when lock is already held', async () => {
            expect.hasAssertions();

            mockTryAcquire.mockResolvedValueOnce(undefined);

            await expect(lastValueFrom(instance.testExclusiveArray$(), { defaultValue: undefined })).resolves.toBeUndefined();
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if resources argument is not defined or empty array is passed', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testExclusiveEmptyResource$())).rejects.toThrow(
                'Lock key is not defined'
            );
            expect(mockTryAcquire).not.toHaveBeenCalled();
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if decorated method does not return observable', async () => {
            expect.hasAssertions();

            // @ts-expect-error HINT: Wrong types test
            await expect(lastValueFrom(instance.testExclusiveSync())).rejects.toThrow(
                'Method TestClass::testExclusiveSync does not return an observable'
            );
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle acquire lock failed', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockTryAcquire.mockRejectedValue(new Error(errorMsg));

            await expect(lastValueFrom(instance.testExclusiveLockFailed$())).rejects.toThrow(errorMsg);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle release lock failed', async () => {
            expect.hasAssertions();

            mockRelease.mockRejectedValue(new Error('Failed to release lock'));

            await expect(lastValueFrom(instance.testExclusiveLockFailed$())).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockTryAcquire.mockRejectedValue(new Error(errorMsg));
            mockErrorFn.mockReturnValue(EMPTY);

            await lastValueFrom(instance.testExclusiveLockFailedErrorFn$(), { defaultValue: undefined });

            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
            expect(mockErrorFn).toHaveBeenCalledWith(new Error(errorMsg));
        });

        it('should handle throwing error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Failed to acquire lock';
            mockTryAcquire.mockRejectedValue(new Error(errorMsg));
            const catchErrorFnErrorMsg = 'Error in catchErrorFn';
            mockErrorFn.mockImplementation(() => {
                throw new Error(catchErrorFnErrorMsg);
            });

            await expect(lastValueFrom(instance.testExclusiveLockFailedErrorFn$())).rejects.toThrow(
                catchErrorFnErrorMsg
            );
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should use overridden duration when provided', async () => {
            expect.hasAssertions();

            await expect(lastValueFrom(instance.testExclusiveOverrideDuration$())).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 5000);
        });

        it('should release lock after result function', async () => {
            expect.hasAssertions();

            mockTryAcquire.mockResolvedValue({ release: mockRelease });

            await expect(lastValueFrom(instance.testExclusiveReleaseAfterResultFn$())).resolves.toBe(1);
            expect(mockResultFn).toHaveBeenCalledWith();
            expect(mockRelease).toHaveBeenCalledWith();

            const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
            const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

            expect(resultCallOrder).toBeLessThan(releaseCallOrder);
        });
    });
});
