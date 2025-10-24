import Redlock, { type Settings } from 'redlock';

import type Redis from 'ioredis';

// HINT: We need redlock instance with redis for the decorator
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
