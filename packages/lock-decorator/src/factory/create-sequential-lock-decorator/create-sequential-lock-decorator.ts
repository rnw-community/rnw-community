import { createInterceptor } from '@rnw-community/decorators-core';

import { createLockMiddleware } from '../../util/create-lock-middleware/create-lock-middleware';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';

export const createSequentialLockDecorator =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Promise<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: SequentialLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, unknown>({
            middlewares: [createLockMiddleware<TArgs>(options.store, 'sequential', arg)],
        }) as unknown as MethodDecoratorType<K>;
