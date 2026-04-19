import { resolveExclusiveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options-interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument-type/exclusive-lock-argument.type';

type Stage3Decorator<TArgs extends readonly unknown[]> = (
    originalMethod: (this: unknown, ...args: TArgs) => unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => unknown>
) => (this: unknown, ...args: TArgs) => Promise<unknown>;

export const createExclusiveLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: ExclusiveLockArgumentType<TArgs>): Stage3Decorator<TArgs> =>
    (originalMethod, _context) => {
        return function exclusiveLocked(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveExclusiveLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'exclusive', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };
    };
