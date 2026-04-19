
import { resolveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/decorators-core';

export const createSequentialLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: SequentialLockArgumentType<TArgs>): MethodDecoratorType =>
    (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function interceptedMethod(this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveLockKey(arg, args);

            return runWithLock(options.store, key, 'sequential', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as unknown as (this: unknown, ...fnArgs: any[]) => unknown).apply(this, [...args])
            );
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
