import Redlock, { type Settings } from 'redlock';

import type Redis from 'ioredis';

/**
 * @deprecated Use `createPromiseLockDecorators` or `createObservableLockDecorators` with a custom `LockServiceInterface` instead.
 */
export class LockableService {
    readonly redlock: Redlock;

    constructor(
        // TODO: Add support for multiple redis clients/sentinels/clusters?
        private readonly redisClient: Redis,
        options?: Partial<Settings>
    ) {
        this.redlock = new Redlock([this.redisClient], options);
    }
}
