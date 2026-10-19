import type { ExclusiveLockArgumentType } from './exclusive-lock-argument.type';
import type { SequentialLockArgumentType } from './sequential-lock-argument.type';

/**
 * The union of sequential and exclusive key arguments accepted by the raw lock middleware.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#lockargumenttypetargs
 */
export type LockArgumentType<TArgs extends readonly unknown[]> =
    | SequentialLockArgumentType<TArgs>
    | ExclusiveLockArgumentType<TArgs>;
