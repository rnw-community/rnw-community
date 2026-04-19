import type { LegacyMethodDecoratorType } from '@rnw-community/decorators-core';

import { resolveLockKey } from '../../util/resolve-lock-key/resolve-lock-key';
import { runWithLock } from '../../util/run-with-lock/run-with-lock';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options-interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument-type/sequential-lock-argument.type';

export const createLegacySequentialLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: SequentialLockArgumentType<TArgs>): LegacyMethodDecoratorType =>
    (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function (this: unknown, ...args: TArgs): Promise<unknown> {
            const { key, options: acquireOptions } = resolveLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'sequential', acquireOptions, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as unknown as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
