import type { AcquireOptionsInterface } from './acquire-options.interface';
import type { LockHandleInterface } from './lock-handle.interface';
import type { LockModeType } from '../type/lock-mode.type';

export interface LockStoreInterface {
    acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface) => Promise<LockHandleInterface>;
}
