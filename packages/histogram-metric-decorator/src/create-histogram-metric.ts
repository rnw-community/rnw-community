import { createInterceptor } from '@rnw-community/decorators-core';
import type { ExecutionContextInterface } from '@rnw-community/decorators-core';

import type { CreateHistogramMetricOptionsInterface } from './create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from './histogram-options.interface';

/**
 * Factory that returns a stage-3 (TC39) method decorator for recording call durations.
 *
 * **Behavior note**: Unlike the legacy `@HistogramMetric` in `nestjs-enterprise` (which used a
 * synchronous try/finally and did NOT await Promises), this implementation always awaits
 * Promises before recording the observation. This gives accurate end-to-end durations for
 * async methods. The observation is emitted on both the success and error paths.
 *
 * @example
 * ```ts
 * const HistogramMetric = createHistogramMetric({ transport: myTransport });
 *
 * class OrderService {
 *   \@HistogramMetric()
 *   async placeOrder(order: Order): Promise<Receipt> { ... }
 *
 *   \@HistogramMetric({ name: 'order_fetch_duration_ms', labels: ([id]) => ({ orderId: id }) })
 *   async fetchOrder(id: string): Promise<Order> { ... }
 * }
 * ```
 */
export const createHistogramMetric =
    (options: CreateHistogramMetricOptionsInterface) =>
    <TArgs extends readonly unknown[]>(
        config?: HistogramOptionsInterface<TArgs>
    ): ReturnType<typeof createInterceptor<TArgs, unknown>> => {
        const resolveName = (ctx: ExecutionContextInterface<TArgs>): string =>
            config?.name ?? `${ctx.className}_${ctx.methodName}_duration_ms`;

        return createInterceptor<TArgs, unknown>({
            interceptor: {
                onSuccess: (ctx, _result, durationMs) => {
                    const labels = config?.labels?.(ctx.args);
                    options.transport.observe(resolveName(ctx), durationMs, labels);
                },
                onError: (ctx, _error, durationMs) => {
                    const labels = config?.labels?.(ctx.args);
                    options.transport.observe(resolveName(ctx), durationMs, labels);
                },
            },
            strategies: options.strategies,
        });
    };
