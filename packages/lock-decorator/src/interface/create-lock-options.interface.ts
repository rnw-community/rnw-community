import type { LockStoreInterface } from './lock-store.interface';
import type { ResultStrategyInterface } from '@rnw-community/decorators-core';


export interface CreateLockOptionsInterface {
    readonly store: LockStoreInterface;
    readonly strategies?: readonly ResultStrategyInterface[];
}
