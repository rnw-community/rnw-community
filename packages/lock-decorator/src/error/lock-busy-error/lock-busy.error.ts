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
