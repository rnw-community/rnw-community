import type { LockModeType } from '../type/lock-mode.type';

/**
 * The handle a store resolves after acquiring a key, released by the decorators once the protected call finishes.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockhandleinterface
 */
export interface LockHandleInterface {
    /** The acquired lock key. */
    readonly key: string;
    /** The mode the key was acquired in. */
    readonly mode: LockModeType;
    /** Releases the key so the next waiter can acquire it. */
    release: () => void | Promise<void>;
}
