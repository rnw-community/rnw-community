import { createLegacyInterceptor } from '@rnw-community/decorators-core';
import type { LegacyMethodDecoratorType } from '@rnw-community/decorators-core';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import { createLogInterceptor } from './create-log-interceptor';
import type { ErrorLogInputType, PostLogInputType, PreLogInputType } from './log-input.type';

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
