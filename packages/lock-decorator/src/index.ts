export type { LockModeType } from './type/lock-mode.type';
export type { SequentialLockArgumentType } from './type/sequential-lock-argument.type';
export type { ExclusiveLockArgumentType } from './type/exclusive-lock-argument.type';
export type { LockArgumentType } from './type/lock-argument.type';

export type { AcquireOptionsInterface } from './interface/acquire-options.interface';
export type { LockHandleInterface } from './interface/lock-handle.interface';
export type { LockStoreInterface } from './interface/lock-store.interface';
export type { CreateLockOptionsInterface } from './interface/create-lock-options.interface';
export type { InMemoryLockStoreInterface } from './interface/in-memory-lock-store.interface';

export { LockBusyError } from './error/lock-busy-error/lock-busy.error';
export { LockAcquireTimeoutError } from './error/lock-acquire-timeout-error/lock-acquire-timeout.error';

export { createInMemoryLockStore } from './store/create-in-memory-lock-store/create-in-memory-lock-store';

export { createSequentialLockDecorator } from './factory/create-sequential-lock-decorator/create-sequential-lock-decorator';
export { createExclusiveLockDecorator } from './factory/create-exclusive-lock-decorator/create-exclusive-lock-decorator';

export { runWithLock$ } from './util/run-with-lock-rxjs/run-with-lock-rxjs';
