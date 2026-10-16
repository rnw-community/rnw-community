/**
 * The wait options forwarded to `LockStoreInterface.acquire` for sequential locks.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#acquireoptionsinterface
 */
export interface AcquireOptionsInterface {
    /** The maximum time in milliseconds to wait for the key before the store should reject with `LockAcquireTimeoutError`. */
    readonly timeoutMs?: number;
    /** The signal that cancels the pending acquisition when aborted. */
    readonly signal?: AbortSignal;
}
