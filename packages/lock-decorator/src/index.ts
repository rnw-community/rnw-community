export type { LockModeType } from './type/lock-mode-type/lock-mode.type';
export type { SequentialLockArgumentType } from './type/sequential-lock-argument-type/sequential-lock-argument.type';
export type { ExclusiveLockArgumentType } from './type/exclusive-lock-argument-type/exclusive-lock-argument.type';
export type { LockArgumentType } from './type/lock-argument-type/lock-argument.type';

export type { AcquireOptionsInterface } from './interface/acquire-options-interface/acquire-options.interface';
export type { LockHandleInterface } from './interface/lock-handle-interface/lock-handle.interface';
export type { LockStoreInterface } from './interface/lock-store-interface/lock-store.interface';
export type { CreateLockOptionsInterface } from './interface/create-lock-options-interface/create-lock-options.interface';

export { LockBusyError } from './error/lock-busy-error/lock-busy.error';
export { LockAcquireTimeoutError } from './error/lock-acquire-timeout-error/lock-acquire-timeout.error';

export type { InMemoryLockStoreInterface } from './store/create-in-memory-lock-store/create-in-memory-lock-store';
export { createInMemoryLockStore } from './store/create-in-memory-lock-store/create-in-memory-lock-store';

export { createSequentialLock } from './factory/create-sequential-lock/create-sequential-lock';
export { createExclusiveLock } from './factory/create-exclusive-lock/create-exclusive-lock';

export { createLegacySequentialLock } from './factory/create-legacy-sequential-lock/create-legacy-sequential-lock';
export { createLegacyExclusiveLock } from './factory/create-legacy-exclusive-lock/create-legacy-exclusive-lock';
