import { createInterceptor } from '@rnw-community/decorators-core';

import { createHistogramMiddleware } from '../../util/create-histogram-middleware/create-histogram-middleware';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createHistogramMetricDecorator =
    (options: CreateHistogramMetricOptionsInterface) =>
    <K extends AnyFn, TArgs extends Parameters<K> = Parameters<K>>(
        config?: HistogramOptionsInterface<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, unknown>({
            middleware: createHistogramMiddleware<TArgs>(options, config),
        }) as unknown as MethodDecoratorType<K>;
