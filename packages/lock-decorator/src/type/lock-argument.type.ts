import type { ExclusiveLockArgumentType } from './exclusive-lock-argument.type';
import type { SequentialLockArgumentType } from './sequential-lock-argument.type';

export type LockArgumentType<TArgs extends readonly unknown[]> =
    | SequentialLockArgumentType<TArgs>
    | ExclusiveLockArgumentType<TArgs>;
