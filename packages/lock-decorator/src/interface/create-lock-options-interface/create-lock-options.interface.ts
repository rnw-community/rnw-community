import type { ResultStrategyInterface } from '@rnw-community/decorators-core';

import type { LockStoreInterface } from '../lock-store-interface/lock-store.interface';

export interface CreateLockOptionsInterface {
    readonly store: LockStoreInterface;
    readonly strategies?: readonly ResultStrategyInterface[];
}
