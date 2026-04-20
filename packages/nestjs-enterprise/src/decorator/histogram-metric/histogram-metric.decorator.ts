import { Histogram, type HistogramConfiguration, type LabelValues, register } from 'prom-client';

import { createHistogramMetricDecorator } from '@rnw-community/histogram-metric-decorator';
import { isDefined } from '@rnw-community/shared';

import type { HistogramOptionsInterface, HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';

const MS_PER_SECOND = 1000;

type HistogramMetricConfig<M extends string, TArgs extends readonly unknown[]> = Omit<HistogramConfiguration<M>, 'name'> & {
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
};

const resolveExistingHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> | undefined => {
    const registries = configuration?.registers ?? [register];

    for (const item of registries) {
        const existing = item.getSingleMetric(metricName);

        if (existing instanceof Histogram) {
            return existing as Histogram<M>;
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
        observe: (_name, durationMs, labelValues) => {
            const seconds = durationMs / MS_PER_SECOND;
            if (isDefined(labelValues)) {
                histogram.observe(labelValues as LabelValues<M>, seconds);

                return;
            }
            histogram.observe(seconds);
        },
    };
};

export const HistogramMetric = <M extends string, TArgs extends readonly unknown[] = readonly unknown[]>(
    metricName: string,
    configuration?: HistogramMetricConfig<M, TArgs>
) => {
    const { labels, ...promConfig } = configuration ?? {};

    return createHistogramMetricDecorator({
        transport: createPromClientTransport(metricName, promConfig as Omit<HistogramConfiguration<M>, 'name'>),
    })({ name: metricName, labels: labels as HistogramOptionsInterface<readonly unknown[]>['labels'] });
};
