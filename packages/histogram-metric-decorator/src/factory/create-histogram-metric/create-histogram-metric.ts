import { createInterceptor } from '@rnw-community/decorators-core';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options.interface';
import type { MethodDecoratorType } from '@rnw-community/decorators-core';

export const createHistogramMetric =
    (options: CreateHistogramMetricOptionsInterface) =>
    <TArgs extends readonly unknown[]>(config?: HistogramOptionsInterface<TArgs>): MethodDecoratorType =>
        createInterceptor<TArgs, unknown>({
            interceptor: {
                onSuccess: (ctx, _result, durationMs) => {
                    options.transport.observe(
                        config?.name ?? `${ctx.className}_${ctx.methodName}_duration_ms`,
                        durationMs,
                        config?.labels?.(ctx.args)
                    );
                },
                onError: (ctx, _error, durationMs) => {
                    options.transport.observe(
                        config?.name ?? `${ctx.className}_${ctx.methodName}_duration_ms`,
                        durationMs,
                        config?.labels?.(ctx.args)
                    );
                },
            },
            strategies: options.strategies,
        });
