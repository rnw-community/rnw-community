import {
    type AcquireOptionsInterface,
    LockBusyError,
    type LockHandleInterface,
    type LockModeType,
    type LockStoreInterface,
} from '@rnw-community/lock-decorator';
import { isDefined } from '@rnw-community/shared';

import { RESOURCE_SEPARATOR } from './resource-separator.const';

import type { LockServiceInterface } from './interface/lock-service.interface';

export const createLockServiceStore = (lockService: LockServiceInterface, duration: number): LockStoreInterface => ({
    acquire: async (
        key: string,
        mode: LockModeType,
        _options?: AcquireOptionsInterface
    ): Promise<LockHandleInterface> => {
        const resources = key.split(RESOURCE_SEPARATOR);

        if (mode === 'exclusive') {
            const handle = await lockService.tryAcquire(resources, duration);
            if (!isDefined(handle)) {
                throw new LockBusyError(key);
            }

            return { key, mode, release: () => handle.release() };
        }

        const handle = await lockService.acquire(resources, duration);

        return { key, mode, release: () => handle.release() };
    },
});
