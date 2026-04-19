import { createInterceptor } from '@rnw-community/decorators-core';

import { createLogInterceptor } from './create-log-interceptor';

import type { CreateLogOptionsInterface, ErrorLogInputType, PostLogInputType, PreLogInputType } from './types';

export const createLog =
    (options: CreateLogOptionsInterface) =>
    <TArgs extends readonly unknown[], TResult>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ) =>
        createInterceptor<TArgs, TResult>({
            interceptor: createLogInterceptor<TArgs, TResult>(options, preLog, postLog, errorLog),
            strategies: options.strategies,
        });
