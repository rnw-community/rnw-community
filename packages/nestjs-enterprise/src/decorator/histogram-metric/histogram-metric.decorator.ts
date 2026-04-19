import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { createLegacyHistogramMetric } from '@rnw-community/histogram-metric-decorator';
import type { HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

const MS_PER_SECOND = 1000;

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

const createPromClientTransport = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): HistogramTransportInterface => {
    const histogram = resolveHistogram(metricName, configuration);
    return {
        observe: (_name, durationMs) => {
            histogram.observe(durationMs / MS_PER_SECOND);
        },
    };
};

export const HistogramMetric = <M extends string, K extends AnyFn>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): MethodDecoratorType<K> =>
    createLegacyHistogramMetric({
        transport: createPromClientTransport(metricName, configuration),
        strategies: [observableStrategy],
    })({ name: metricName }) as unknown as MethodDecoratorType<K>;
