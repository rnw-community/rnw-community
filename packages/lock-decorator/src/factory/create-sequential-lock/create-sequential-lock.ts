import { resolveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options-interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument-type/sequential-lock-argument.type';
import type { Stage3DecoratorType } from '../../type/stage3-decorator-type/stage3-decorator.type';

export const createSequentialLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: SequentialLockArgumentType<TArgs>): Stage3DecoratorType<TArgs> =>
    (originalMethod, _context) => {
        return function sequentialLocked(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'sequential', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };
    };
