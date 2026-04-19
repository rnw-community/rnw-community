import { createInterceptor } from '@rnw-community/decorators-core';

import { createLogInterceptor } from './create-log-interceptor';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import type { ErrorLogInputType } from './error-log-input.type';
import type { PostLogInputType } from './post-log-input.type';
import type { PreLogInputType } from './pre-log-input.type';

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
