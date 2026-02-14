import type { LockHandle } from './lock-handle.interface';

export interface LockServiceInterface {
    acquire(resources: string[], duration: number): Promise<LockHandle>;
    tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined>;
}
