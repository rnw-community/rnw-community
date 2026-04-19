import { describe, expect, it, jest } from '@jest/globals';

import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { runWithLock } from './run-with-lock';

describe('runWithLock', () => {
    it('runs async fn and returns result', async () => {
        const store = createInMemoryLockStore();
        const result = await runWithLock(store, 'k', 'sequential', {}, async () => 42);
        expect(result).toBe(42);
    });

    it('runs sync fn and returns result', async () => {
        const store = createInMemoryLockStore();
        const result = await runWithLock(store, 'k', 'sequential', {}, () => 'sync');
        expect(result).toBe('sync');
    });

    it('releases lock even when fn throws', async () => {
        const store = createInMemoryLockStore();
        await expect(
            runWithLock(store, 'k', 'sequential', {}, () => {
                throw new Error('boom');
            })
        ).rejects.toThrow('boom');

        const handle = await store.acquire('k', 'sequential');
        expect(handle.key).toBe('k');
        void handle.release();
    });

    it('releases lock even when async fn rejects', async () => {
        const store = createInMemoryLockStore();
        await expect(
            runWithLock(store, 'k', 'sequential', {}, async () => {
                throw new Error('async boom');
            })
        ).rejects.toThrow('async boom');

        const handle = await store.acquire('k', 'sequential');
        expect(handle.key).toBe('k');
        void handle.release();
    });

    it('swallows release errors silently', async () => {
        const releaseError = new Error('release fail');
        const mockHandle = {
            key: 'k',
            mode: 'sequential' as const,
            release: jest.fn<() => Promise<void>>().mockRejectedValue(releaseError),
        };
        const mockStore = {
            acquire: jest.fn<typeof mockHandle.release>().mockResolvedValue(mockHandle as never),
        };

        const result = await runWithLock(mockStore as never, 'k', 'sequential', {}, () => 'ok');
        expect(result).toBe('ok');
    });

    it('awaits a thenable that is not a real Promise until resolution', async () => {
        const store = createInMemoryLockStore();

        let lockReleasedBeforeResolution = false;

        let thenableResolve!: (value: string) => void;
        const thenable = {
            then: (onFulfilled: (value: string) => void): void => {
                thenableResolve = onFulfilled;
            },
        };

        const lockRunPromise = runWithLock(store, 'thenable-key', 'sequential', {}, () => thenable);

        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 10));

        const concurrentAcquire = store.acquire('thenable-key', 'sequential').then((handle) => {
            lockReleasedBeforeResolution = true;

            return handle.release();
        });

        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(lockReleasedBeforeResolution).toBe(false);

        thenableResolve('thenable-result');

        const result = await lockRunPromise;
        expect(result).toBe('thenable-result');

        await concurrentAcquire;
        expect(lockReleasedBeforeResolution).toBe(true);
    });
});
