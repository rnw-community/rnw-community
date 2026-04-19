import {
    LockBusyError,
    type AcquireOptionsInterface,
    type LockHandleInterface,
    type LockModeType,
    type LockStoreInterface,
} from '@rnw-community/lock-decorator';

import type { LockServiceInterface } from '../interface/lock-service.interface';

/**
 * Separator used to encode a multi-resource array into a single string key
 * so the new @rnw-community/lock-decorator (which takes `key: string`) can
 * carry the original array through to the NestJS LockServiceInterface (which
 * takes `resources: string[]`). The separator is NUL — not a legal resource
 * character in any reasonable producer.
 */
export const RESOURCE_SEPARATOR = '\x00';

export const createLockServiceStore = (lockService: LockServiceInterface, duration: number): LockStoreInterface => ({
    acquire: async (
        key: string,
        mode: LockModeType,
        _options?: AcquireOptionsInterface
    ): Promise<LockHandleInterface> => {
        const resources = key.split(RESOURCE_SEPARATOR);

        if (mode === 'exclusive') {
            const handle = await lockService.tryAcquire(resources, duration);
            if (handle === undefined) {
                throw new LockBusyError(key);
            }
            return { key, mode, release: () => handle.release() };
        }

        const handle = await lockService.acquire(resources, duration);
        return { key, mode, release: () => handle.release() };
    },
});
