import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { createPromiseLockDecorators } from './create-promise-lock-decorators';

import type { LockHandle } from '../interface/lock-handle.interface';
import type { LockServiceInterface } from '../interface/lock-service.interface';


const mockRelease = jest.fn<() => Promise<void>>().mockResolvedValue();
const mockAcquire = jest
    .fn<(resources: string[], duration: number) => Promise<LockHandle>>()
    .mockResolvedValue({ release: mockRelease });
const mockTryAcquire = jest
    .fn<(resources: string[], duration: number) => Promise<LockHandle | undefined>>()
    .mockResolvedValue({ release: mockRelease });

const injectedSymbols: symbol[] = [];

jest.mock('@nestjs/common', () => ({
    Inject: () => (_target: object, key: symbol) => {
        injectedSymbols.push(key);
    },
}));

const mockErrorFn = jest.fn();
const mockResultFn = jest.fn();

abstract class MockLockService implements LockServiceInterface {
    abstract acquire(resources: string[], duration: number): Promise<LockHandle>;
    abstract tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined>;
}

const { SequentialLock, ExclusiveLock } = createPromiseLockDecorators(MockLockService, 1000);

class TestClass {
    readonly field = 1;

    @SequentialLock(['test'])
    async testArray(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @SequentialLock(id => ['test', String(id)])
    async testFunction(id: number): Promise<number[]> {
        return Promise.resolve([this.field, id]);
    }

    @SequentialLock(['test'])
    testSync(): number {
        return this.field;
    }

    @SequentialLock([])
    testEmptyResource(): number {
        return this.field;
    }

    @SequentialLock(['test'])
    async testLockFailed(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @SequentialLock(['test'], (err: unknown) => {
        mockErrorFn(err);

        return Promise.resolve(0);
    })
    async testLockFailedErrorFn(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @SequentialLock(['test'])
    testReleaseAfterResultFn(): Promise<number> {
        mockResultFn();

        return Promise.resolve(this.field);
    }

    @SequentialLock(['test'], undefined, 5000)
    async testOverrideDuration(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @ExclusiveLock(['test'])
    async testExclusiveArray(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @ExclusiveLock(id => ['test', String(id)])
    async testExclusiveFunction(id: number): Promise<number[]> {
        return Promise.resolve([this.field, id]);
    }

    @ExclusiveLock(['test'])
    testExclusiveSync(): number {
        return this.field;
    }

    @ExclusiveLock([])
    testExclusiveEmptyResource(): number {
        return this.field;
    }

    @ExclusiveLock(['test'])
    async testExclusiveLockFailed(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @ExclusiveLock(['test'], (err: unknown) => {
        mockErrorFn(err);

        return Promise.resolve(0);
    })
    async testExclusiveLockFailedErrorFn(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @ExclusiveLock(['test'])
    testExclusiveReleaseAfterResultFn(): Promise<number> {
        mockResultFn();

        return Promise.resolve(this.field);
    }

    @ExclusiveLock(['test'], undefined, 5000)
    async testExclusiveOverrideDuration(): Promise<number> {
        return Promise.resolve(this.field);
    }
}

const getMockLockService = (): LockServiceInterface => ({ acquire: mockAcquire, tryAcquire: mockTryAcquire });

describe('createPromiseLockDecorators', () => {
    let instance: TestClass;

    beforeEach(() => {
        jest.clearAllMocks();
        instance = new TestClass();
        // HINT: Simulate NestJS DI by setting the lock service on the instance via the captured symbols
        for (const sym of injectedSymbols) {
            (instance as unknown as Record<symbol, unknown>)[sym] = getMockLockService();
        }
    });

    describe('SequentialLock', () => {
        it('should lock resource with key as array and duration', async () => {
            expect.hasAssertions();

            await expect(instance.testArray()).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should lock resource with key as function and duration', async () => {
            expect.hasAssertions();

            await expect(instance.testFunction(1)).resolves.toStrictEqual([1, 1]);
            expect(mockAcquire).toHaveBeenCalledWith(['test', '1'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should throw error if resources argument is not defined or empty array is passed', async () => {
            expect.hasAssertions();

            await expect(instance.testEmptyResource()).rejects.toThrow('Lock key is not defined');
            expect(mockAcquire).not.toHaveBeenCalled();
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if decorated method does not return promise', async () => {
            expect.hasAssertions();

            await expect(instance.testSync()).rejects.toThrow(
                'Method TestClass::testSync does not return a promise'
            );
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle acquire lock failed', async () => {
            expect.hasAssertions();

            mockAcquire.mockRejectedValueOnce(new Error('Acquire lock failed'));

            await expect(instance.testLockFailed()).rejects.toThrow('Acquire lock failed');
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle release lock failed', async () => {
            expect.hasAssertions();

            mockRelease.mockRejectedValueOnce(new Error('Release lock failed'));

            await expect(instance.testLockFailed()).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Acquire lock failed';
            mockAcquire.mockRejectedValueOnce(new Error(errorMsg));
            // @ts-expect-error Test preconditions
            mockErrorFn.mockResolvedValue(0);

            await expect(instance.testLockFailedErrorFn()).resolves.toBe(0);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle throwing error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Acquire lock failed';
            mockAcquire.mockRejectedValueOnce(new Error(errorMsg));
            const catchErrorFnErrorMsg = 'Error in catchErrorFn';
            mockErrorFn.mockImplementation(() => {
                throw new Error(catchErrorFnErrorMsg);
            });

            await expect(instance.testLockFailedErrorFn()).rejects.toThrow(catchErrorFnErrorMsg);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should release lock after result function', async () => {
            expect.hasAssertions();

            mockAcquire.mockResolvedValue({ release: mockRelease });

            await expect(instance.testReleaseAfterResultFn()).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();

            const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
            const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

            expect(resultCallOrder).toBeLessThan(releaseCallOrder);
        });

        it('should use overridden duration when provided', async () => {
            expect.hasAssertions();

            await expect(instance.testOverrideDuration()).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 5000);
        });
    });

    describe('ExclusiveLock', () => {
        it('should lock resource with key as array and duration', async () => {
            expect.hasAssertions();

            await expect(instance.testExclusiveArray()).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should lock resource with key as function and duration', async () => {
            expect.hasAssertions();

            await expect(instance.testExclusiveFunction(1)).resolves.toStrictEqual([1, 1]);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test', '1'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should return undefined when lock is already held', async () => {
            expect.hasAssertions();

            mockTryAcquire.mockResolvedValueOnce(undefined);

            await expect(instance.testExclusiveArray()).resolves.toBeUndefined();
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if resources argument is not defined or empty array is passed', async () => {
            expect.hasAssertions();

            await expect(instance.testExclusiveEmptyResource()).rejects.toThrow('Lock key is not defined');
            expect(mockTryAcquire).not.toHaveBeenCalled();
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if decorated method does not return promise', async () => {
            expect.hasAssertions();

            await expect(instance.testExclusiveSync()).rejects.toThrow(
                'Method TestClass::testExclusiveSync does not return a promise'
            );
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle acquire lock failed', async () => {
            expect.hasAssertions();

            mockTryAcquire.mockRejectedValueOnce(new Error('Acquire lock failed'));

            await expect(instance.testExclusiveLockFailed()).rejects.toThrow('Acquire lock failed');
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle release lock failed', async () => {
            expect.hasAssertions();

            mockRelease.mockRejectedValueOnce(new Error('Release lock failed'));

            await expect(instance.testExclusiveLockFailed()).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should handle error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Acquire lock failed';
            mockTryAcquire.mockRejectedValueOnce(new Error(errorMsg));
            // @ts-expect-error Test preconditions
            mockErrorFn.mockResolvedValue(0);

            await expect(instance.testExclusiveLockFailedErrorFn()).resolves.toBe(0);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should handle throwing error in catchErrorFn', async () => {
            expect.hasAssertions();

            const errorMsg = 'Acquire lock failed';
            mockTryAcquire.mockRejectedValueOnce(new Error(errorMsg));
            const catchErrorFnErrorMsg = 'Error in catchErrorFn';
            mockErrorFn.mockImplementation(() => {
                throw new Error(catchErrorFnErrorMsg);
            });

            await expect(instance.testExclusiveLockFailedErrorFn()).rejects.toThrow(catchErrorFnErrorMsg);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should release lock after result function', async () => {
            expect.hasAssertions();

            mockTryAcquire.mockResolvedValue({ release: mockRelease });

            await expect(instance.testExclusiveReleaseAfterResultFn()).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 1000);
            expect(mockRelease).toHaveBeenCalledWith();

            const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
            const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

            expect(resultCallOrder).toBeLessThan(releaseCallOrder);
        });

        it('should use overridden duration when provided', async () => {
            expect.hasAssertions();

            await expect(instance.testExclusiveOverrideDuration()).resolves.toBe(1);
            expect(mockTryAcquire).toHaveBeenCalledWith(['test'], 5000);
        });
    });

    describe('factory isolation', () => {
        it('should support multiple factories with different services on the same class', async () => {
            expect.hasAssertions();

            abstract class SecondMockLockService implements LockServiceInterface {
                abstract acquire(resources: string[], duration: number): Promise<LockHandle>;
                abstract tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined>;
            }

            const { SequentialLock: SequentialLock2 } = createPromiseLockDecorators(SecondMockLockService, 2000);

            class MultiFactoryClass {
                @SequentialLock(['first'])
                async methodA(): Promise<string> {
                    return Promise.resolve('a');
                }

                @SequentialLock2(['second'])
                async methodB(): Promise<string> {
                    return Promise.resolve('b');
                }
            }

            const multi = new MultiFactoryClass();
            for (const sym of injectedSymbols) {
                (multi as unknown as Record<symbol, unknown>)[sym] = getMockLockService();
            }

            await expect(multi.methodA()).resolves.toBe('a');
            expect(mockAcquire).toHaveBeenCalledWith(['first'], 1000);
        });

        it('should throw descriptive error when lock service is not injected', async () => {
            expect.hasAssertions();

            const noServiceInstance = new TestClass();

            await expect(noServiceInstance.testArray()).rejects.toThrow(
                'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.'
            );
        });

        it('should throw error when preLock function returns empty array', async () => {
            expect.hasAssertions();

            const { SequentialLock: SeqLockEmpty } = createPromiseLockDecorators(MockLockService, 1000);

            class EmptyKeyClass {
                @SeqLockEmpty(() => [])
                async test(): Promise<number> {
                    return Promise.resolve(1);
                }
            }

            const emptyInstance = new EmptyKeyClass();
            for (const sym of injectedSymbols) {
                (emptyInstance as unknown as Record<symbol, unknown>)[sym] = getMockLockService();
            }

            await expect(emptyInstance.test()).rejects.toThrow('Lock key is not defined');
        });
    });
});
