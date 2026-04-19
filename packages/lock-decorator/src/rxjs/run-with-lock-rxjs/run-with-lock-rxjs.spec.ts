import { describe, expect, it, jest } from '@jest/globals';
import { Observable, lastValueFrom, of, throwError } from 'rxjs';

import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';

import { runWithLock$ } from './run-with-lock-rxjs';

import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';

describe('runWithLock$', () => {
    it('acquires, invokes, emits the values, and releases on complete', async () => {
        expect.hasAssertions();
        const store = createInMemoryLockStore();
        const releaseSpy = jest.fn();
        const spyStore = {
            acquire: async (...args: Parameters<typeof store.acquire>) => {
                const handle = await store.acquire(...args);

                return {
                    key: handle.key,
                    mode: handle.mode,
                    release: () => {
                        releaseSpy();

                        return handle.release();
                    },
                };
            },
        };

        const result = await lastValueFrom(runWithLock$(spyStore, 'k', 'sequential', {}, () => of(1, 2, 3)));
        expect(result).toBe(3);
        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('releases when the inner Observable errors', async () => {
        expect.hasAssertions();
        const store = createInMemoryLockStore();
        const releaseSpy = jest.fn();
        const spyStore = {
            acquire: async (...args: Parameters<typeof store.acquire>) => {
                const handle = await store.acquire(...args);

                return {
                    key: handle.key,
                    mode: handle.mode,
                    release: () => {
                        releaseSpy();

                        return handle.release();
                    },
                };
            },
        };

        const boom = new Error('stream-error');
        await expect(
            lastValueFrom(runWithLock$(spyStore, 'k', 'sequential', {}, () => throwError(() => boom)))
        ).rejects.toBe(boom);
        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('releases when the fn throws synchronously before returning an Observable', async () => {
        expect.hasAssertions();
        const store = createInMemoryLockStore();
        const releaseSpy = jest.fn();
        const spyStore = {
            acquire: async (...args: Parameters<typeof store.acquire>) => {
                const handle = await store.acquire(...args);

                return {
                    key: handle.key,
                    mode: handle.mode,
                    release: () => {
                        releaseSpy();

                        return handle.release();
                    },
                };
            },
        };

        const boom = new Error('sync-throw');
        const fn = (): Observable<unknown> => {
            throw boom;
        };
        await expect(lastValueFrom(runWithLock$(spyStore, 'k', 'sequential', {}, fn))).rejects.toBe(boom);
        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('propagates LockBusyError from the store without wiring a finalize', async () => {
        expect.hasAssertions();
        const store = createInMemoryLockStore();
        const held = await store.acquire('busy', 'exclusive');

        await expect(
            lastValueFrom(runWithLock$(store, 'busy', 'exclusive', {}, () => of(1)))
        ).rejects.toBeInstanceOf(LockBusyError);

        void held.release();
    });

    it('swallows release rejection silently so it does not poison the subscriber', async () => {
        expect.hasAssertions();
        const spyStore = {
            acquire: () =>
                Promise.resolve({
                    key: 'k',
                    mode: 'sequential' as const,
                    release: () => Promise.reject(new Error('release-failed')),
                }),
        };

        const result = await lastValueFrom(runWithLock$(spyStore, 'k', 'sequential', {}, () => of('ok')));
        expect(result).toBe('ok');
    });

    it('releases on unsubscription even if the inner Observable has not completed', async () => {
        expect.hasAssertions();
        const store = createInMemoryLockStore();
        const releaseSpy = jest.fn();
        const spyStore = {
            acquire: async (...args: Parameters<typeof store.acquire>) => {
                const handle = await store.acquire(...args);

                return {
                    key: handle.key,
                    mode: handle.mode,
                    release: () => {
                        releaseSpy();

                        return handle.release();
                    },
                };
            },
        };

        const neverCompleting$ = new Observable<number>((sub) => {
            sub.next(1);
        });
        const sub = runWithLock$(spyStore, 'k', 'sequential', {}, () => neverCompleting$).subscribe();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));
        sub.unsubscribe();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('releases the handle when acquire resolves AFTER the subscriber has already unsubscribed', async () => {
        expect.hasAssertions();
        const releaseSpy = jest.fn();
        let resolveAcquire: ((handle: LockHandleInterface) => void) | undefined;
        const pendingStore: LockStoreInterface = {
            acquire: () =>
                new Promise<LockHandleInterface>((resolve) => {
                    resolveAcquire = resolve;
                }),
        };

        const sub = runWithLock$(pendingStore, 'k', 'sequential', {}, () => of(1)).subscribe();

        sub.unsubscribe();
        resolveAcquire?.({
            key: 'k',
            mode: 'sequential',
            release: () => {
                releaseSpy();
            },
        });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });

    it('aborts the acquire via AbortSignal when the subscriber unsubscribes before acquire resolves', async () => {
        expect.hasAssertions();
        const capturedSignals: AbortSignal[] = [];
        const aborted: boolean[] = [];
        const signalingStore: LockStoreInterface = {
            acquire: (_key, _mode, options) =>
                new Promise<LockHandleInterface>((_resolve, reject) => {
                    const signal = options?.signal;
                    if (signal !== undefined) {
                        capturedSignals.push(signal);
                        signal.addEventListener('abort', () => {
                            aborted.push(true);
                            reject(new DOMException('The operation was aborted.', 'AbortError'));
                        });
                    }
                }),
        };

        const sub = runWithLock$(signalingStore, 'k', 'sequential', {}, () => of(1)).subscribe({
            error: () => void 0,
        });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1));
        sub.unsubscribe();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(capturedSignals).toHaveLength(1);
        expect(aborted).toEqual([true]);
    });

    it('bridges a user-supplied AbortSignal so aborting it rejects the acquire downstream', async () => {
        expect.hasAssertions();
        const signalingStore: LockStoreInterface = {
            acquire: (_key, _mode, options) =>
                new Promise<LockHandleInterface>((_resolve, reject) => {
                    options?.signal?.addEventListener('abort', () =>
                        void reject(new DOMException('The operation was aborted.', 'AbortError'))
                    );
                }),
        };

        const userController = new AbortController();
        const errorSpy = jest.fn();
        runWithLock$(signalingStore, 'k', 'sequential', { signal: userController.signal }, () => of(1)).subscribe({
            error: errorSpy,
        });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 1));
        userController.abort();
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect((errorSpy as jest.Mock).mock.calls[0]?.[0]).toMatchObject({ name: 'AbortError' });
    });

    it('forwards an already-aborted user signal to the store immediately', async () => {
        expect.hasAssertions();
        const capturedAbortedAtCall: boolean[] = [];
        const signalingStore: LockStoreInterface = {
            acquire: (_key, _mode, options) => {
                capturedAbortedAtCall.push(options?.signal?.aborted === true);

                return Promise.reject(new DOMException('The operation was aborted.', 'AbortError'));
            },
        };

        const controller = new AbortController();
        controller.abort();
        const errorSpy = jest.fn();
        runWithLock$(signalingStore, 'k', 'sequential', { signal: controller.signal }, () => of(1)).subscribe({
            error: errorSpy,
        });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(capturedAbortedAtCall).toEqual([true]);
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });
});
