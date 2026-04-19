import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';
import type { AcquireOptionsInterface } from '../acquire-options-interface/acquire-options.interface';
import type { LockHandleInterface } from '../lock-handle-interface/lock-handle.interface';

export interface LockStoreInterface {
    acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface) => Promise<LockHandleInterface>;
}
