import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { createHistogramMetric } from '@rnw-community/histogram-metric-decorator';
import { type AnyFn, type MethodDecoratorType, isDefined } from '@rnw-community/shared';

import type { HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';


const MS_PER_SECOND = 1000;

const resolveHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> => {
    const registry = configuration?.registers?.[0] ?? register;
    const existing = registry.getSingleMetric(metricName) as Histogram<M> | undefined;
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
    createHistogramMetric({
        transport: createPromClientTransport(metricName, configuration),
    })({ name: metricName }) as unknown as MethodDecoratorType<K>;
