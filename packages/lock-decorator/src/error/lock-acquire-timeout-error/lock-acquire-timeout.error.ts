/**
 * The error a store rejects with when a sequential lock's `timeoutMs` elapses before the key becomes free.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockacquiretimeouterror
 */
export class LockAcquireTimeoutError extends Error {
    readonly key: string;
    readonly timeoutMs: number;
    readonly cause?: unknown;

    constructor(key: string, timeoutMs: number, options?: { cause?: unknown }) {
        super(`Lock acquire timed out after ${timeoutMs}ms for key: ${key}`);
        this.key = key;
        this.timeoutMs = timeoutMs;
        this.name = 'LockAcquireTimeoutError';
        this.cause = options?.cause;
    }
}
