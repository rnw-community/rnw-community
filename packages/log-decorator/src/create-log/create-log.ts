import { createInterceptor } from '@rnw-community/decorators-core';

import { createLogInterceptor } from '../util/create-log-interceptor';

import type { CreateLogOptionsInterface } from '../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../type/error-log-input.type';
import type { PostLogInputType } from '../type/post-log-input.type';
import type { PreLogInputType } from '../type/pre-log-input.type';
import type { MethodDecoratorType } from '@rnw-community/decorators-core';

export const createLog =
    (options: CreateLogOptionsInterface) =>
    <TArgs extends readonly unknown[], TResult>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ): MethodDecoratorType =>
        createInterceptor<TArgs, TResult>({
            interceptor: createLogInterceptor<TArgs, TResult>(options, preLog, postLog, errorLog),
            strategies: options.strategies,
        });
