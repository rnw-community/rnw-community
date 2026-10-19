import Redlock, { type Settings } from 'redlock';

import type { Redis } from 'ioredis';

/**
 * Deprecated base class exposing the Redlock instance required by `LockPromise` and `LockObservable`; implement `LockServiceInterface` instead.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/src/decorator/lock/lock-decorator.md
 */
export class LockableService {
    readonly redlock: Redlock;

    constructor(
        private readonly redisClient: Redis,
        options?: Partial<Settings>
    ) {
        this.redlock = new Redlock([this.redisClient], options);
    }
}
