// Types
export type { LockModeType } from './type/lock-mode.type';
export type { LockArgumentType } from './type/lock-argument.type';

// Interfaces
export type { AcquireOptionsInterface } from './interface/acquire-options.interface';
export type { LockHandleInterface } from './interface/lock-handle.interface';
export type { LockStoreInterface } from './interface/lock-store.interface';
export type { CreateLockOptionsInterface } from './interface/create-lock-options.interface';

// Errors
export { LockBusyError } from './error/lock-busy.error';
export { LockAcquireTimeoutError } from './error/lock-acquire-timeout.error';

// Store
export { createInMemoryLockStore } from './store/create-in-memory-lock-store';

// Factories — stage-3 (TC39)
export { createSequentialLock } from './factory/create-sequential-lock';
export { createExclusiveLock } from './factory/create-exclusive-lock';

// Factories — legacy (experimentalDecorators)
export { createLegacySequentialLock } from './factory/create-legacy-sequential-lock';
export { createLegacyExclusiveLock } from './factory/create-legacy-exclusive-lock';
