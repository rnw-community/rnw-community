import { isDefined } from '@rnw-community/shared';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

const acquireSequential = (
    sequentialChains: Map<string, Promise<void>>,
    key: string,
    options?: AcquireOptionsInterface
): Promise<LockHandleInterface> => {
    const timeoutMs = options?.timeoutMs;
    const signal = options?.signal;

    const currentTail = sequentialChains.get(key) ?? Promise.resolve();

    let resolveSlot: () => void;
    const slotPromise = new Promise<void>((res) => {
        resolveSlot = res;
    });

    const nextTail = currentTail.then(() => slotPromise);
    sequentialChains.set(key, nextTail);

    const waitForTurn = new Promise<void>((resolve, reject) => {
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
            if (isDefined(timerId)) {
                clearTimeout(timerId);
            }
        };

        const onAbort = (): void => {
            resolveSlot();
            settle('reject', new DOMException('The operation was aborted.', 'AbortError'));
        };

        const removeSignalListener = (): void => {
            if (isDefined(signal)) {
                signal.removeEventListener('abort', onAbort);
            }
        };

        if (signal?.aborted === true) {
            resolveSlot();
            reject(new DOMException('The operation was aborted.', 'AbortError'));
            return;
        }

        if (isDefined(signal)) {
            signal.addEventListener('abort', onAbort);
        }

        if (isDefined(timeoutMs)) {
            timerId = setTimeout(() => {
                resolveSlot();
                settle('reject', new LockAcquireTimeoutError(key, timeoutMs));
            }, timeoutMs);
        }

        currentTail.then(
            () => {
                settle('resolve');
            },
            /* istanbul ignore next */
            () => {
                settle('resolve');
            }
        );
    });

    return waitForTurn.then(() => {
        let released = false;
        return {
            key,
            mode: 'sequential' as const,
            release: (): void => {
                if (released) {
                    return;
                }
                released = true;
                resolveSlot();
                if (sequentialChains.get(key) === nextTail) {
                    sequentialChains.delete(key);
                }
            },
        };
    });
};

const acquireExclusive = (exclusiveHeld: Set<string>, key: string): Promise<LockHandleInterface> => {
    if (exclusiveHeld.has(key)) {
        return Promise.reject(new LockBusyError(key));
    }

    exclusiveHeld.add(key);

    let released = false;
    const handle: LockHandleInterface = {
        key,
        mode: 'exclusive',
        release: (): void => {
            if (released) {
                return;
            }
            released = true;
            exclusiveHeld.delete(key);
        },
    };

    return Promise.resolve(handle);
};

export const createInMemoryLockStore = (): LockStoreInterface => {
    const sequentialChains = new Map<string, Promise<void>>();
    const exclusiveHeld = new Set<string>();

    return {
        acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface): Promise<LockHandleInterface> => {
            if (mode === 'sequential') {
                return acquireSequential(sequentialChains, key, options);
            }

            return acquireExclusive(exclusiveHeld, key);
        },
    };
};
