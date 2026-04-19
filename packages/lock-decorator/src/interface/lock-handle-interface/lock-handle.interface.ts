import type { LockModeType } from '../../type/lock-mode-type/lock-mode.type';

export interface LockHandleInterface {
    readonly key: string;
    readonly mode: LockModeType;
    release: () => void | Promise<void>;
}
