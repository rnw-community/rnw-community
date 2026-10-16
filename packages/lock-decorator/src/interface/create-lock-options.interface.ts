import type { LockStoreInterface } from './lock-store.interface';


/**
 * The options accepted by all four lock decorator factories.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#createlockoptionsinterface
 */
export interface CreateLockOptionsInterface {
    /** The store every decoration created by the factory acquires its keys from. */
    readonly store: LockStoreInterface;
}
