import {
    LockBusyError,
    type AcquireOptionsInterface,
    type LockHandleInterface,
    type LockModeType,
    type LockStoreInterface,
} from '@rnw-community/lock-decorator';

import { isDefined, isNotEmptyArray } from '@rnw-community/shared';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { PreDecoratorFunction } from '../../../type/pre-decorator-function.type';

export const RESOURCE_SEPARATOR = '\x00';

export const LOCK_SERVICE_NOT_INJECTED_MESSAGE =
    'LockService was not injected. Ensure the lock service provider is registered in the NestJS module.';

export const resolveResources = <TArgs extends unknown[]>(
    preLock: PreDecoratorFunction<TArgs, string[]> | string[],
    args: TArgs
): string[] => {
    const resources = Array.isArray(preLock) ? preLock : preLock(...args);
    if (!isNotEmptyArray(resources)) {
        throw new Error('Lock key is not defined');
    }
    return resources as string[];
};

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
