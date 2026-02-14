export interface LockHandle {
    release(): Promise<void>;
}
