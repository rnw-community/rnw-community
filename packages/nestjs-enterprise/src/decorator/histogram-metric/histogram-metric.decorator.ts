import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { createLegacyInterceptor } from '@rnw-community/decorators-core';
import type { ExecutionContextInterface } from '@rnw-community/decorators-core';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

type EndTimerFnType = ReturnType<Histogram['startTimer']>;

const resolveHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> => {
    const existing = register.getSingleMetric(metricName) as Histogram<M> | undefined;
    if (isDefined(existing)) {
        return existing;
    }
    return new Histogram({
        help: metricName,
        ...configuration,
        name: metricName,
    });
};

export const HistogramMetric =
    <M extends string, K extends AnyFn, TResult extends ReturnType<K>, TArgs extends Parameters<K>>(
            metricName: string,
            configuration?: Omit<HistogramConfiguration<M>, 'name'>
        ): MethodDecoratorType<K> => {
        const histogram = resolveHistogram(metricName, configuration);
        const timers = new WeakMap<ExecutionContextInterface<TArgs>, EndTimerFnType>();

        const stopTimer = (context: ExecutionContextInterface<TArgs>): void => {
            timers.get(context)?.();
            timers.delete(context);
        };

        return createLegacyInterceptor<TArgs, TResult>({
            interceptor: {
                onEnter: (context) => {
                    timers.set(context, histogram.startTimer());
                },
                onSuccess: (context) => {
                    stopTimer(context);
                },
                onError: (context) => {
                    stopTimer(context);
                },
            },
            strategies: [observableStrategy],
        }) as unknown as MethodDecoratorType<K>;
    };
