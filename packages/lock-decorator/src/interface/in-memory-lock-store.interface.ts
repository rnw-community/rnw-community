import type { LockStoreInterface } from '../interface/lock-store.interface';

export interface InMemoryLockStoreInterface extends LockStoreInterface {
    readonly sequentialChainCount: () => number;
    readonly exclusiveHeldCount: () => number;
}
