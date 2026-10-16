import { createInterceptor } from '@rnw-community/decorators-core';

import { createLockMiddleware$ } from '../../util/create-lock-middleware-observable/create-lock-middleware-observable';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';
import type { Observable } from 'rxjs';

/**
 * Creates a sequential (FIFO-queued per key) lock decorator factory for `Observable`-returning methods that holds the lock for the subscription lifetime.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/lock-decorator/readme.md#createsequentiallockdecorator-1
 */
export const createSequentialLockDecorator$ =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Observable<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: SequentialLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, Observable<unknown>>({
            middleware: createLockMiddleware$<TArgs>(options.store, 'sequential', arg),
        }) as unknown as MethodDecoratorType<K>;
