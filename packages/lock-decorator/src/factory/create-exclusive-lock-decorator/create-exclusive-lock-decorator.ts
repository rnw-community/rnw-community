import { createPromiseInterceptor } from '@rnw-community/decorators-core';

import { createLockResource } from '../../util/create-lock-resource/create-lock-resource';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';

export const createExclusiveLockDecorator =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Promise<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: ExclusiveLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createPromiseInterceptor<K, TArgs>({
            interceptor: {},
            resource: createLockResource<TArgs>(options.store, 'exclusive', arg),
        });
