import { emptyFn } from '@rnw-community/shared';

import { resolveLockKey } from '../resolve-lock-key/resolve-lock-key';

import type { LockStoreInterface } from '../../interface/lock-store.interface';
import type { LockArgumentType } from '../../type/lock-argument.type';
import type { LockModeType } from '../../type/lock-mode.type';
import type { InterceptorMiddleware } from '@rnw-community/decorators-core';

export const createLockMiddleware = <TArgs extends readonly unknown[]>(
    store: LockStoreInterface,
    mode: LockModeType,
    arg: LockArgumentType<TArgs>
): InterceptorMiddleware<TArgs> => ({
    invoke: async (context, next) => {
        const { key, options } = resolveLockKey(arg, context.args);
        const handle = await store.acquire(key, mode, options);
        try {
            return await Promise.resolve(next());
        } finally {
            await Promise.resolve()
                .then(() => handle.release())
                .catch(emptyFn);
        }
    },
});
