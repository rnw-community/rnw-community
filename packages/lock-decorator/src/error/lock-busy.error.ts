export class LockBusyError extends Error {
    readonly key: string;

    constructor(key: string) {
        super(`Lock is busy for key: ${key}`);
        this.key = key;
        this.name = 'LockBusyError';
    }
}
