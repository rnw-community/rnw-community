import { createLegacyInterceptor } from '@rnw-community/decorators-core';
import type { LegacyMethodDecoratorType } from '@rnw-community/decorators-core';

import type { CreateLogOptionsInterface, ErrorLogInputType, PostLogInputType, PreLogInputType } from './types';
import { createLogInterceptor } from './create-log-interceptor';

export const createLegacyLog =
    (options: CreateLogOptionsInterface) =>
    <TArgs extends readonly unknown[], TResult>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ): LegacyMethodDecoratorType =>
        createLegacyInterceptor<TArgs, TResult>({
            interceptor: createLogInterceptor<TArgs, TResult>(options, preLog, postLog, errorLog),
            strategies: options.strategies,
        });
