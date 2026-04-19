export class LockAcquireTimeoutError extends Error {
    readonly key: string;
    readonly timeoutMs: number;

    constructor(key: string, timeoutMs: number) {
        super(`Lock acquire timed out after ${timeoutMs}ms for key: ${key}`);
        this.key = key;
        this.timeoutMs = timeoutMs;
        this.name = 'LockAcquireTimeoutError';
    }
}
