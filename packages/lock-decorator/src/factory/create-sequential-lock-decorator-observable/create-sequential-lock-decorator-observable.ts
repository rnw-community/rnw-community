import { createObservableInterceptor } from '@rnw-community/decorators-core/rxjs';

import { createLockResource$ } from '../../util/create-lock-resource-observable/create-lock-resource-observable';

import type { CreateLockOptionsInterface } from '../../interface/create-lock-options.interface';
import type { SequentialLockArgumentType } from '../../type/sequential-lock-argument.type';
import type { MethodDecoratorType } from '@rnw-community/shared';
import type { Observable } from 'rxjs';

export const createSequentialLockDecorator$ =
    (options: CreateLockOptionsInterface) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- decorator generic must accept any-parameter method
    <K extends (...args: readonly any[]) => Observable<unknown>, TArgs extends Parameters<K> = Parameters<K>>(
        arg: SequentialLockArgumentType<TArgs>
    ): MethodDecoratorType<K> =>
        createObservableInterceptor<K, TArgs>({
            interceptor: {},
            resource$: createLockResource$<TArgs>(options.store, 'sequential', arg),
        });
