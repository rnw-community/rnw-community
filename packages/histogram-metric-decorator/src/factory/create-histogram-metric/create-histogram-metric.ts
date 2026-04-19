import { createInterceptor } from '@rnw-community/decorators-core';
import type { ExecutionContextInterface } from '@rnw-community/decorators-core';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options-interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options-interface/histogram-options.interface';

const deriveName = <TArgs extends readonly unknown[]>(
    ctx: ExecutionContextInterface<TArgs>,
    config?: HistogramOptionsInterface<TArgs>
): string => config?.name ?? `${ctx.className}_${ctx.methodName}_duration_ms`;

export const createHistogramMetric =
    (options: CreateHistogramMetricOptionsInterface) =>
    <TArgs extends readonly unknown[]>(
        config?: HistogramOptionsInterface<TArgs>
    ): ReturnType<typeof createInterceptor<TArgs, unknown>> =>
        createInterceptor<TArgs, unknown>({
            interceptor: {
                onSuccess: (ctx, _result, durationMs) => {
                    options.transport.observe(deriveName(ctx, config), durationMs, config?.labels?.(ctx.args));
                },
                onError: (ctx, _error, durationMs) => {
                    options.transport.observe(deriveName(ctx, config), durationMs, config?.labels?.(ctx.args));
                },
            },
            strategies: options.strategies,
        });
