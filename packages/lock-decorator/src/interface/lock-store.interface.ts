
import type { AcquireOptionsInterface } from './acquire-options.interface.js';
import type { LockHandleInterface } from './lock-handle.interface.js';
import type { LockModeType } from '../type/lock-mode.type.js';

export interface LockStoreInterface {
    acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface) => Promise<LockHandleInterface>;
}
