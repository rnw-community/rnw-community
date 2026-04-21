import { createInterceptor } from '@rnw-community/decorators-core';

import { createLockMiddleware$ } from '../../util/create-lock-middleware-observable/create-lock-middleware-observable';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { ExclusiveLockArgumentType } from '../../type/exclusive-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';
import type { Observable } from 'rxjs';

export const createExclusiveLockDecorator$ =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Observable<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: ExclusiveLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, Observable<unknown>>({
            middlewares: [createLockMiddleware$<TArgs>(options.store, 'exclusive', arg)],
        }) as unknown as MethodDecoratorType<K>;
