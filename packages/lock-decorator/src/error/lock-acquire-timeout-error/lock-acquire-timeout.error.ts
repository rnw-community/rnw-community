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
