import { resolveLockKey } from '../util/resolve-lock-key';
import { runWithLock } from '../util/run-with-lock';

import type { CreateLockOptionsInterface } from '../interface/create-lock-options.interface';
import type { LockArgumentType } from '../type/lock-argument.type';

type Stage3Decorator<TArgs extends readonly unknown[]> = (
    originalMethod: (this: unknown, ...args: TArgs) => unknown,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ClassMethodDecoratorContext<any, (this: unknown, ...args: TArgs) => unknown>
) => (this: unknown, ...args: TArgs) => Promise<unknown>;

export const createSequentialLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: LockArgumentType<TArgs>): Stage3Decorator<TArgs> =>
    (originalMethod, _context) => {
        return function sequentialLocked(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, timeoutMs } = resolveLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'sequential', { timeoutMs }, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };
    };
