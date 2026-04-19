import { isDefined } from '@rnw-community/shared';

import { LockAcquireTimeoutError } from '../../error/lock-acquire-timeout-error/lock-acquire-timeout.error';
import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

type SettleFn = (action: 'resolve' | 'reject', value?: unknown) => void;

const buildSettle = (
    resolve: () => void,
    reject: (reason?: unknown) => void,
    clearTimer: () => void,
    removeListener: () => void
): SettleFn => {
    let settled = false;

    return (action, value) => {
        if (settled) {
            return;
        }
        settled = true;
        clearTimer();
        removeListener();
        if (action === 'resolve') {
            resolve();
        } else {
            reject(value as Error);
        }
    };
};

const buildTimer = (
    key: string,
    timeoutMs: number,
    resolveSlot: () => void,
    settle: SettleFn
): ReturnType<typeof setTimeout> =>
    setTimeout(() => {
        resolveSlot();
        settle('reject', new LockAcquireTimeoutError(key, timeoutMs));
    }, timeoutMs);

interface WaitForTurnContext {
    readonly resolve: () => void;
    readonly reject: (reason?: unknown) => void;
    readonly resolveSlot: () => void;
    readonly currentTail: Promise<void>;
    readonly key: string;
    readonly timeoutMs: number | undefined;
    readonly signal: AbortSignal | undefined;
}

// eslint-disable-next-line max-statements
const buildWaitForTurn = (ctx: WaitForTurnContext): void => {
    const { resolve, reject, resolveSlot, currentTail, key, timeoutMs, signal } = ctx;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let removeListener: () => void = () => void 0;

    const clearTimer = (): void => { if (isDefined(timerId)) { clearTimeout(timerId); } };
    const settle = buildSettle(resolve, reject, clearTimer, () => void removeListener());

    if (signal?.aborted === true) {
        resolveSlot();
        reject(new DOMException('The operation was aborted.', 'AbortError'));

        return;
    }

    if (isDefined(signal)) {
        const onAbort = (): void => { resolveSlot(); settle('reject', new DOMException('The operation was aborted.', 'AbortError')); };
        signal.addEventListener('abort', onAbort);
        removeListener = () => { signal.removeEventListener('abort', onAbort); };
    }

    if (isDefined(timeoutMs)) {
        timerId = buildTimer(key, timeoutMs, resolveSlot, settle);
    }

    void currentTail.then(
        () => void settle('resolve'),
        /* istanbul ignore next */
        () => void settle('resolve')
    );
};

const acquireSequential = (
    sequentialChains: Map<string, Promise<void>>,
    key: string,
    options?: AcquireOptionsInterface
): Promise<LockHandleInterface> => {
    const timeoutMs = options?.timeoutMs;
    const signal = options?.signal;
    const currentTail = sequentialChains.get(key) ?? Promise.resolve();

    let resolveSlot!: () => void;
     
    const slotPromise = new Promise<void>((resolve) => { resolveSlot = resolve; });

    const nextTail = currentTail.then(() => slotPromise);
    sequentialChains.set(key, nextTail);

    const waitForTurn = new Promise<void>((resolve, reject) => {
        buildWaitForTurn({ resolve, reject, resolveSlot, currentTail, key, timeoutMs, signal });
    });

    const deleteTailIfStillOurs = (): void => {
        if (sequentialChains.get(key) === nextTail) {
            sequentialChains.delete(key);
        }
    };

    return waitForTurn.then(
        () => {
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
                    deleteTailIfStillOurs();
                },
            };
        },
        (err: unknown) => {
            void nextTail.then(deleteTailIfStillOurs);
            throw err;
        }
    );
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

export interface InMemoryLockStoreInterface extends LockStoreInterface {
    readonly sequentialChainCount: () => number;
    readonly exclusiveHeldCount: () => number;
}

export const createInMemoryLockStore = (): InMemoryLockStoreInterface => {
    const sequentialChains = new Map<string, Promise<void>>();
    const exclusiveHeld = new Set<string>();

    return {
        acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface): Promise<LockHandleInterface> => {
            if (mode === 'sequential') {
                return acquireSequential(sequentialChains, key, options);
            }

            return acquireExclusive(exclusiveHeld, key);
        },
        sequentialChainCount: () => sequentialChains.size,
        exclusiveHeldCount: () => exclusiveHeld.size,
    };
};
