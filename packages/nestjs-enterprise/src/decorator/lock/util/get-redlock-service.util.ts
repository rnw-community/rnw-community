import { validateRedlock } from './validate-redlock.util';

import type { LockServiceInterface } from '../interface/lock-service.interface';
import type { LockableService } from '../service/lockable.service';

/** @deprecated Used by deprecated `LockPromise`/`LockObservable` decorators. */
export const getRedlockService = (instance: unknown): LockServiceInterface => {
    const self = instance as LockableService;
    validateRedlock(self);

    return {
        acquire: (keys, dur) => self.redlock.acquire(keys, dur),
        // eslint-disable-next-line no-undefined
        tryAcquire: (keys, dur) => self.redlock.acquire(keys, dur, { retryCount: 0 }).catch(() => undefined),
    };
};
