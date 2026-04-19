import { resolveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument.type';
import type { Stage3DecoratorType } from '../../type/stage3-decorator.type';

export const createExclusiveLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[], TResult>(
        arg: ExclusiveLockArgumentType<TArgs>
    ): Stage3DecoratorType<TArgs, TResult> =>
    (originalMethod, _context) =>
        function exclusiveLocked(this: unknown, ...args: TArgs): Promise<TResult> {
            const { key, options: acquireOptions } = resolveLockKey(arg, args);

            return runWithLock(options.store, key, 'exclusive', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => Promise<TResult>).apply(this, [...args])
            ) as Promise<TResult>;
        };
