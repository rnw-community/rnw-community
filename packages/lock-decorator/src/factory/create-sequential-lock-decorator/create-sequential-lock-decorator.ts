import { createPromiseInterceptor } from '@rnw-community/decorators-core';

import { createLockResource } from '../../util/create-lock-resource/create-lock-resource';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';

export const createSequentialLockDecorator =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Promise<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: SequentialLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createPromiseInterceptor<K, TArgs>({
            interceptor: {},
            resource: createLockResource<TArgs>(options.store, 'sequential', arg),
        });
