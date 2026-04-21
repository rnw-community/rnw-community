import { completionObservableStrategy } from '@rnw-community/decorators-core/rxjs';

import { createInterceptor } from '@rnw-community/decorators-core';

import type { CreateHistogramMetricOptionsInterface } from '../../interface/create-histogram-metric-options.interface';
import type { HistogramOptionsInterface } from '../../interface/histogram-options.interface';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

const resolveLabelsSafely = <TArgs extends readonly unknown[]>(
    labelsFn: HistogramOptionsInterface<TArgs>['labels'],
    args: TArgs,
    onLabelsError: CreateHistogramMetricOptionsInterface['onLabelsError']
): Readonly<Record<string, string>> | undefined => {
    if (labelsFn === undefined) {
        return undefined;
    }
    try {
        return labelsFn(args);
    } catch (err) {
        onLabelsError?.(err, args);

        return undefined;
    }
};

export const createHistogramMetricDecorator =
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
                        resolveLabelsSafely(config?.labels, ctx.args, options.onLabelsError)
                    );
                },
                onError: (ctx, _error, durationMs) => {
                    options.transport.observe(
                        config?.name ?? `${ctx.className}_${ctx.methodName}_duration_ms`,
                        durationMs,
                        resolveLabelsSafely(config?.labels, ctx.args, options.onLabelsError)
                    );
                },
            },
            strategies: [completionObservableStrategy],
        }) as unknown as MethodDecoratorType<K>;
