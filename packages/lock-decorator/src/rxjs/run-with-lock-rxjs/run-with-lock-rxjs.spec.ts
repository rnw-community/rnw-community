import { describe, expect, it, jest } from '@jest/globals';
import { Observable, lastValueFrom, of, throwError } from 'rxjs';

import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { runWithLock$ } from './run-with-lock-rxjs';

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

        held.release();
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
        await new Promise((r) => setTimeout(r, 5));
        sub.unsubscribe();
        await new Promise((r) => setTimeout(r, 5));
        expect(releaseSpy).toHaveBeenCalledTimes(1);
    });
});
