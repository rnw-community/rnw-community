
import type { AcquireOptionsInterface } from './acquire-options.interface';
import type { LockHandleInterface } from './lock-handle.interface';
import type { LockModeType } from '../type/lock-mode.type';

/**
 * The pluggable lock backend (in-process, Redis, cluster-aware) that owns key acquisition and its queueing or busy semantics.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockstoreinterface
 */
export interface LockStoreInterface {
    /** Acquires `key` in the given mode, resolving with a handle or rejecting with `LockBusyError`, `LockAcquireTimeoutError`, or an abort error. */
    acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface) => Promise<LockHandleInterface>;
}
