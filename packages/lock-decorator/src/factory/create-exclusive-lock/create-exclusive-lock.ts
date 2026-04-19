import { resolveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options-interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument-type/exclusive-lock-argument.type';
import type { Stage3DecoratorType } from '../../type/stage3-decorator-type/stage3-decorator.type';

export const createExclusiveLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: ExclusiveLockArgumentType<TArgs>): Stage3DecoratorType<TArgs> =>
    (originalMethod, _context) => function exclusiveLocked(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveLockKey(arg, args);

            return runWithLock(options.store, key, 'exclusive', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => unknown).apply(this, [...args])
            );
        };
