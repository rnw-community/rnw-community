import { Histogram, type HistogramConfiguration, register } from 'prom-client';

import { createHistogramMetricDecorator } from '@rnw-community/histogram-metric-decorator';
import { isDefined } from '@rnw-community/shared';

import type { HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';

const MS_PER_SECOND = 1000;

const resolveExistingHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> | undefined => {
    const registries = configuration?.registers ?? [register];

    for (const item of registries) {
        const existing = item.getSingleMetric(metricName) as Histogram<M> | undefined;

        if (isDefined(existing)) {
            return existing;
        }
    }

    return void 0;
};

const resolveHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> =>
    resolveExistingHistogram(metricName, configuration) ??
    new Histogram({
        help: metricName,
        ...configuration,
        name: metricName,
    });

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

export const HistogramMetric = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
) =>
    createHistogramMetricDecorator({
        transport: createPromClientTransport(metricName, configuration),
    })({ name: metricName });
