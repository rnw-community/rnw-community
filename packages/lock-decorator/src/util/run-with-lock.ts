import type { AcquireOptionsInterface } from '../interface/acquire-options.interface';
import type { LockHandleInterface } from '../interface/lock-handle.interface';
import type { LockStoreInterface } from '../interface/lock-store.interface';
import type { LockModeType } from '../type/lock-mode.type';

/**
 * Acquires a lock on `key`, runs `fn`, releases the lock in a finally block.
 * Release errors are swallowed silently so they don't pollute the caller.
 */
export const runWithLock = async (
    store: LockStoreInterface,
    key: string,
    mode: LockModeType,
    options: AcquireOptionsInterface,
    fn: () => unknown
): Promise<unknown> => {
    let handle: LockHandleInterface | undefined;

    try {
        handle = await store.acquire(key, mode, options);
        const result = fn();

        // Await promises; pass through sync results
        return result instanceof Promise ? await result : result;
    } finally {
        if (handle !== undefined) {
            try {
                await handle.release();
            } catch {
                // Silently swallow release errors
            }
        }
    }
};
