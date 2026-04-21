import { resolveLockKey } from '../resolve-lock-key/resolve-lock-key';

import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockArgumentType } from '../../type/lock-argument.type';
import type { LockModeType } from '../../type/lock-mode.type';
import type { ResourceInterface } from '@rnw-community/decorators-core';

export const createLockResource = <TArgs extends readonly unknown[]>(
    store: LockStoreInterface,
    mode: LockModeType,
    arg: LockArgumentType<TArgs>
): ResourceInterface<TArgs> => ({
    acquire: async (context) => {
        const { key, options } = resolveLockKey(arg, context.args);
        const handle = await store.acquire(key, mode, options);

        return { release: () => handle.release() };
    },
});
