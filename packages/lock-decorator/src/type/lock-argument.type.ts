import type { ExclusiveLockArgumentType } from './exclusive-lock-argument.type.js';
import type { SequentialLockArgumentType } from './sequential-lock-argument.type.js';

export type LockArgumentType<TArgs extends readonly unknown[]> =
    | SequentialLockArgumentType<TArgs>
    | ExclusiveLockArgumentType<TArgs>;
