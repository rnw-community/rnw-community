import { createLegacyInterceptor } from '@rnw-community/decorators-core';

import { createLogInterceptor } from './create-log-interceptor';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import type { ErrorLogInputType } from './error-log-input.type';
import type { PostLogInputType } from './post-log-input.type';
import type { PreLogInputType } from './pre-log-input.type';
import type { LegacyMethodDecoratorType } from '@rnw-community/decorators-core';

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
