export interface LockHandle {
    release(): Promise<unknown>;
}
