import { completionObservableStrategy, createInterceptor } from '@rnw-community/decorators-core';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createHistogramMetric =
    (options: CreateHistogramMetricOptionsInterface) =>
    <K extends AnyFn, TArgs extends Parameters<K> = Parameters<K>>(
        config?: HistogramOptionsInterface<TArgs>
    ): MethodDecoratorType<K> =>
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
            strategies: [completionObservableStrategy],
        }) as unknown as MethodDecoratorType<K>;
