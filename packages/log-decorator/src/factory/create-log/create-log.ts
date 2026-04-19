import { createInterceptor } from '@rnw-community/decorators-core';

import type { CreateLogOptionsInterface } from '../../interface/create-log-options-interface/create-log-options.interface';
import type { ErrorLogInputType } from '../../type/error-log-input-type/error-log-input.type';
import type { PostLogInputType } from '../../type/post-log-input-type/post-log-input.type';
import type { PreLogInputType } from '../../type/pre-log-input-type/pre-log-input.type';
import { createLogInterceptor } from '../create-log-interceptor/create-log-interceptor';

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
