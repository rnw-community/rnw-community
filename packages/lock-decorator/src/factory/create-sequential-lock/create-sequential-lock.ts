import { resolveSequentialLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options-interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument-type/sequential-lock-argument.type';

type Stage3Decorator<TArgs extends readonly unknown[]> = (
    originalMethod: (this: unknown, ...args: TArgs) => unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => unknown>
) => (this: unknown, ...args: TArgs) => Promise<unknown>;

export const createSequentialLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: SequentialLockArgumentType<TArgs>): Stage3Decorator<TArgs> =>
    (originalMethod, _context) => {
        return function sequentialLocked(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveSequentialLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'sequential', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };
    };
