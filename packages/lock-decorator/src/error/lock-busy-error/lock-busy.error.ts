/**
 * The error a store rejects with when an exclusive lock is requested for a key that is already held.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockbusyerror
 */
export class LockBusyError extends Error {
    readonly key: string;
    readonly cause?: unknown;

    constructor(key: string, options?: { cause?: unknown }) {
        super(`Lock is busy for key: ${key}`);
        this.key = key;
        this.name = 'LockBusyError';
        this.cause = options?.cause;
    }
}
