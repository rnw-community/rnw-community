import { createInterceptor } from '@rnw-community/decorators-core';

import { createLockMiddleware } from '../../util/create-lock-middleware/create-lock-middleware';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';

export const createExclusiveLockDecorator =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Promise<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: ExclusiveLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, unknown>({
            middleware: createLockMiddleware<TArgs>(options.store, 'exclusive', arg),
        }) as unknown as MethodDecoratorType<K>;
