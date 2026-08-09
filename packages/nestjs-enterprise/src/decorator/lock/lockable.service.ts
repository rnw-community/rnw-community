import Redlock, { type Settings } from 'redlock';

import type { Redis } from 'ioredis';

export class LockableService {
    readonly redlock: Redlock;

    constructor(
        private readonly redisClient: Redis,
        options?: Partial<Settings>
    ) {
        this.redlock = new Redlock([this.redisClient], options);
    }
}
