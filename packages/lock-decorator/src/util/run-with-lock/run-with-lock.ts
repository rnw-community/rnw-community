import { isDefined, isPromise } from '@rnw-community/shared';

import type { AcquireOptionsInterface } from '../../interface/acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../../interface/lock-handle-interface/lock-handle.interface';
import type { LockStoreInterface } from '../../interface/lock-store-interface/lock-store.interface';
import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

interface RunWithLockArgs {
    readonly store: LockStoreInterface;
    readonly key: string;
    readonly mode: LockModeType;
    readonly options: AcquireOptionsInterface;
    readonly fn: () => unknown;
}

const runWithLockImpl = async ({ store, key, mode, options, fn }: RunWithLockArgs): Promise<unknown> => {
    let handle: LockHandleInterface | undefined;

    try {
        handle = await store.acquire(key, mode, options);
        const result = fn();
        if (!isPromise(result)) {
            throw new Error('Locked method must return a Promise');
        }

        return await result;
    } finally {
        if (isDefined(handle)) {
            await Promise.resolve(handle.release()).catch(() => void 0);
        }
    }
};

/* eslint-disable @typescript-eslint/max-params */
export const runWithLock = (
    store: LockStoreInterface,
    key: string,
    mode: LockModeType,
    options: AcquireOptionsInterface,
    fn: () => unknown
): Promise<unknown> => runWithLockImpl({ store, key, mode, options, fn });
/* eslint-enable @typescript-eslint/max-params */
