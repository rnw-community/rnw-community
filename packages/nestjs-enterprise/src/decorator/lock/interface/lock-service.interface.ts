import type { LockHandle } from './lock-handle.interface';

/**
 * The contract an injectable NestJS provider implements to back the lock decorators created by `createPromiseLockDecorators` and `createObservableLockDecorators`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-enterprise/readme.md#types
 */
export interface LockServiceInterface {
    /** Waits until all resources are locked for `duration` milliseconds, used by the sequential decorators. */
    acquire(resources: string[], duration: number): Promise<LockHandle>;
    /** Locks all resources for `duration` milliseconds without waiting, resolving `undefined` on contention, used by the exclusive decorators. */
    tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined>;
}
