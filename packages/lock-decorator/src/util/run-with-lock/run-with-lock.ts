import { isDefined, isPromise } from '@rnw-community/shared';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

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

        return isPromise(result) ? await result : result;
    } finally {
        if (isDefined(handle)) {
            try {
                await handle.release();
            } catch {
            }
        }
    }
};
