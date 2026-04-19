import { LockBusyError } from '../error/lock-busy.error';
import { LockAcquireTimeoutError } from '../error/lock-acquire-timeout.error';

import type { AcquireOptionsInterface } from '../interface/acquire-options.interface';
import type { LockHandleInterface } from '../interface/lock-handle.interface';
import type { LockStoreInterface } from '../interface/lock-store.interface';
import type { LockModeType } from '../type/lock-mode.type';

export const createInMemoryLockStore = (): LockStoreInterface => {
    // Sequential: each key maps to the tail of a promise chain
    const sequentialChains = new Map<string, Promise<void>>();
    // Exclusive: set of currently held keys
    const exclusiveHeld = new Set<string>();

    const acquireSequential = async (key: string, options?: AcquireOptionsInterface): Promise<LockHandleInterface> => {
        const timeoutMs = options?.timeoutMs;
        const signal = options?.signal;

        // Capture the current tail so we know where we are in queue
        const currentTail = sequentialChains.get(key) ?? Promise.resolve();

        let resolveSlot: () => void;
        // This slot promise represents "we hold the lock"
        const slotPromise = new Promise<void>((res) => {
            resolveSlot = res;
        });

        // Register our slot as the new tail
        const nextTail = currentTail.then(() => slotPromise);
        sequentialChains.set(key, nextTail);

        // Wait for the current tail (all predecessors) to complete
        // While respecting timeout and abort signal
        await new Promise<void>((resolve, reject) => {
            let settled = false;

            const settle = (action: 'resolve' | 'reject', value?: unknown): void => {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimer();
                removeSignalListener();
                if (action === 'resolve') {
                    resolve();
                } else {
                    reject(value as Error);
                }
            };

            let timerId: ReturnType<typeof setTimeout> | undefined;
            const clearTimer = (): void => {
                if (timerId !== undefined) {
                    clearTimeout(timerId);
                }
            };

            const onAbort = (): void => {
                // Release our slot immediately so next waiter can proceed
                resolveSlot();
                // Clean up the chain if we were the tail
                if (sequentialChains.get(key) === nextTail) {
                    sequentialChains.delete(key);
                }
                settle('reject', new DOMException('The operation was aborted.', 'AbortError'));
            };

            const removeSignalListener = (): void => {
                if (signal !== undefined) {
                    signal.removeEventListener('abort', onAbort);
                }
            };

            // Check if already aborted
            if (signal?.aborted === true) {
                resolveSlot();
                /* istanbul ignore else -- synchronous executor: no other acquire can run between resolveSlot and this check */
                if (sequentialChains.get(key) === nextTail) {
                    sequentialChains.delete(key);
                }
                reject(new DOMException('The operation was aborted.', 'AbortError'));
                return;
            }

            if (signal !== undefined) {
                signal.addEventListener('abort', onAbort);
            }

            if (timeoutMs !== undefined) {
                timerId = setTimeout(() => {
                    // Release our slot so next waiter can proceed
                    resolveSlot();
                    // Clean up the chain if we were the tail
                    if (sequentialChains.get(key) === nextTail) {
                        sequentialChains.delete(key);
                    }
                    settle('reject', new LockAcquireTimeoutError(key, timeoutMs));
                }, timeoutMs);
            }

            currentTail.then(
                () => {
                    settle('resolve');
                },
                /* istanbul ignore next -- slotPromise never rejects; defensive branch only */
                () => {
                    settle('resolve');
                }
            );
        });

        return {
            key,
            mode: 'sequential',
            release: (): void => {
                resolveSlot();
                // Clean up map if we are the current tail
                if (sequentialChains.get(key) === nextTail) {
                    sequentialChains.delete(key);
                }
            },
        };
    };

    const acquireExclusive = (key: string): Promise<LockHandleInterface> => {
        if (exclusiveHeld.has(key)) {
            return Promise.reject(new LockBusyError(key));
        }

        exclusiveHeld.add(key);

        const handle: LockHandleInterface = {
            key,
            mode: 'exclusive',
            release: (): void => {
                exclusiveHeld.delete(key);
            },
        };

        return Promise.resolve(handle);
    };

    return {
        acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface): Promise<LockHandleInterface> => {
            if (mode === 'sequential') {
                return acquireSequential(key, options);
            }

            return acquireExclusive(key);
        },
    };
};
