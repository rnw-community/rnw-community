import { createInterceptor } from '@rnw-community/decorators-core';

import { createLogInterceptor } from '../util/create-log-interceptor';

import type { CreateLogOptionsInterface } from '../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../type/error-log-input.type';
import type { PostLogInputType } from '../type/post-log-input.type';
import type { PreLogInputType } from '../type/pre-log-input.type';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';
import type { Observable } from 'rxjs';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

export const createLog =
    (options: CreateLogOptionsInterface) =>
    <
        K extends AnyFn,
        TArgs extends Parameters<K> = Parameters<K>,
        TResult extends GetResultType<ReturnType<K>> = GetResultType<ReturnType<K>>,
    >(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, TResult>({
            interceptor: createLogInterceptor<TArgs, TResult>(options, preLog, postLog, errorLog),
            strategies: options.strategies,
        }) as unknown as MethodDecoratorType<K>;
