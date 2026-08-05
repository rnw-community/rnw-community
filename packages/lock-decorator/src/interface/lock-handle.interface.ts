import type { LockModeType } from '../type/lock-mode.type.js';

export interface LockHandleInterface {
    readonly key: string;
    readonly mode: LockModeType;
    release: () => void | Promise<void>;
}
