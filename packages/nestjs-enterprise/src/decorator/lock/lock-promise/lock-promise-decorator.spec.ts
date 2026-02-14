import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import Redis from 'ioredis';

import { LockableService } from '../service/lockable.service';

import { LockPromise } from './lock-promise.decorator';

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

class TestClass extends LockableService {
    readonly field = 1;

    constructor() {
        super(getRedisService());
    }

    @LockPromise(['test'], 1000)
    async testArray(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @LockPromise(id => ['test', String(id)], 1000)
    async testFunction(id: number): Promise<number[]> {
        return Promise.resolve([this.field, id]);
    }

    @LockPromise(['test'], 1000)
    testSync(): number {
        return this.field;
    }

    @LockPromise([], 1000)
    testEmptyResource(): number {
        return this.field;
    }

    @LockPromise(['test'], 1000)
    async testLockFailed(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @LockPromise(['test'], 1000, (err: unknown) => {
        mockErrorFn(err);

        return Promise.resolve(0);
    })
    async testLockFailedErrorFn(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @LockPromise(['test'], 1000)
    testReleaseAfterResultFn(): Promise<number> {
        mockResultFn();

        return Promise.resolve(this.field);
    }

    @LockPromise(['test'], 1000, undefined, 0)
    async testExclusive(): Promise<number> {
        return Promise.resolve(this.field);
    }

    @LockPromise(id => ['test', String(id)], 1000, undefined, 0)
    async testExclusiveFunction(id: number): Promise<number[]> {
        return Promise.resolve([this.field, id]);
    }

    @LockPromise(['test'], 1000, undefined, 0)
    testExclusiveSync(): number {
        return this.field;
    }
}

 
describe('LockPromiseDecorator', () => {
     
    beforeEach(() => void jest.clearAllMocks());

    it('should lock resource with key as array and duration', async () => {
        expect.assertions(3);

        const instance = new TestClass();

        await expect(instance.testArray()).resolves.toBe(1);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should lock resource with key as function and duration', async () => {
        expect.assertions(3);

        const instance = new TestClass();

        await expect(instance.testFunction(1)).resolves.toStrictEqual([1, 1]);
        expect(mockAcquire).toHaveBeenCalledWith([`test`, `1`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should throw error if redlock is not available', async () => {
        expect.assertions(3);

        const instance = new TestClass();
        // @ts-expect-error Test preconditions
        instance.redlock = undefined;

        // eslint-disable-next-line @typescript-eslint/unbound-method
        await expect(instance.testArray).rejects.toThrow(
            'Redlock is not available on this instance. Ensure that the class using the `Lock` decorator extends `LockableService` or provide redlock field manually.'
        );
        expect(mockAcquire).not.toHaveBeenCalledWith([`test`, `1`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
    });

    it('should throw error if resources argument is not defined or empty array is passed', async () => {
        expect.assertions(3);

        const instance = new TestClass();

        await expect(instance.testEmptyResource()).rejects.toThrow(`Lock key is not defined`);
        expect(mockAcquire).not.toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalledWith();
    });

    it('should throw error if decorated method doest not return promise', async () => {
        expect.assertions(3);

        const instance = new TestClass();

        await expect(instance.testSync()).rejects.toThrow(`Method TestClass::testSync does not return a promise`);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should handle acquire lock failed', async () => {
        expect.assertions(3);

        const instance = new TestClass();
        mockAcquire.mockRejectedValueOnce(new Error('Acquire lock failed'));

        await expect(instance.testLockFailed()).rejects.toThrow('Acquire lock failed');
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalled();
    });

    it('should handle release lock failed', async () => {
        expect.assertions(3);

        const instance = new TestClass();
        mockRelease.mockRejectedValueOnce(new Error('Release lock failed'));

        await expect(instance.testLockFailed()).resolves.toBe(1);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();
    });

    it('should handle error in catchErrorFn', async () => {
        expect.assertions(3);

        const instance = new TestClass();
        const errorMsg = 'Acquire lock failed';
        mockAcquire.mockRejectedValueOnce(new Error(errorMsg));
        // @ts-expect-error Test preconditions
        mockErrorFn.mockResolvedValue(0);

        await expect(instance.testLockFailedErrorFn()).resolves.toBe(0);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalled();
    });

    it('should handle throwing error in catchErrorFn', async () => {
        expect.assertions(3);

        const instance = new TestClass();
        const errorMsg = 'Acquire lock failed';
        mockAcquire.mockRejectedValueOnce(new Error(errorMsg));
        const catchErrorFnErrorMsg = 'Error in catchErrorFn';
        mockErrorFn.mockImplementation(() => {
            throw new Error(catchErrorFnErrorMsg);
        });

        await expect(instance.testLockFailedErrorFn()).rejects.toThrow(catchErrorFnErrorMsg);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).not.toHaveBeenCalled();
    });

    it('should release lock after result function', async () => {
        expect.assertions(4);

        const instance = new TestClass();
        mockAcquire.mockResolvedValue({ release: mockRelease });

        await expect(instance.testReleaseAfterResultFn()).resolves.toBe(1);
        expect(mockAcquire).toHaveBeenCalledWith([`test`], 1000);
        expect(mockRelease).toHaveBeenCalledWith();

        const [resultCallOrder] = mockResultFn.mock.invocationCallOrder;
        const [releaseCallOrder] = mockRelease.mock.invocationCallOrder;

        expect(resultCallOrder).toBeLessThan(releaseCallOrder);
    });

    describe('retryCount: 0 (exclusive mode)', () => {
        it('should acquire lock and execute method', async () => {
            expect.assertions(3);

            const instance = new TestClass();

            await expect(instance.testExclusive()).resolves.toBe(1);
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000, { retryCount: 0 });
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should lock resource with key as function and duration', async () => {
            expect.assertions(3);

            const instance = new TestClass();

            await expect(instance.testExclusiveFunction(1)).resolves.toStrictEqual([1, 1]);
            expect(mockAcquire).toHaveBeenCalledWith(['test', '1'], 1000, { retryCount: 0 });
            expect(mockRelease).toHaveBeenCalledWith();
        });

        it('should return undefined when lock is already held', async () => {
            expect.assertions(3);

            const instance = new TestClass();
            mockAcquire.mockRejectedValueOnce(new Error('Lock already held'));

            await expect(instance.testExclusive()).resolves.toBeUndefined();
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000, { retryCount: 0 });
            expect(mockRelease).not.toHaveBeenCalled();
        });

        it('should throw error if decorated method does not return promise', async () => {
            expect.assertions(3);

            const instance = new TestClass();

            await expect(instance.testExclusiveSync()).rejects.toThrow(
                'Method TestClass::testExclusiveSync does not return a promise'
            );
            expect(mockAcquire).toHaveBeenCalledWith(['test'], 1000, { retryCount: 0 });
            expect(mockRelease).toHaveBeenCalledWith();
        });
    });
});
