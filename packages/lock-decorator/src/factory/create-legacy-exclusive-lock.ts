import type { LegacyMethodDecoratorType } from '@rnw-community/decorators-core';

import { resolveLockKey } from '../util/resolve-lock-key';
import { runWithLock } from '../util/run-with-lock';

import type { CreateLockOptionsInterface } from '../interface/create-lock-options.interface';
import type { LockArgumentType } from '../type/lock-argument.type';

export const createLegacyExclusiveLock =
    (options: CreateLockOptionsInterface) =>
    <TArgs extends readonly unknown[]>(arg: LockArgumentType<TArgs>): LegacyMethodDecoratorType =>
    (_target, _propertyKey, descriptor) => {
        const originalMethod = descriptor.value;
        if (typeof originalMethod !== 'function') {
            return descriptor;
        }

        const interceptedMethod = function (this: unknown, ...args: TArgs): Promise<unknown> {
            const { key } = resolveLockKey(arg, args);
            const self = this;

            return runWithLock(options.store, key, 'exclusive', {}, () =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (originalMethod as unknown as (this: unknown, ...fnArgs: any[]) => unknown).apply(self, [...args])
            );
        };

        return {
            ...descriptor,
            value: interceptedMethod as unknown as typeof descriptor.value,
        };
    };
