import { Histogram, type HistogramConfiguration, type LabelValues, type Registry, register } from 'prom-client';

import { createHistogramMetricDecorator } from '@rnw-community/histogram-metric-decorator';
import { isDefined } from '@rnw-community/shared';

import { histogramMetricTracking } from './histogram-metric-tracking';

import type { HistogramOptionsInterface, HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';

const MS_PER_SECOND = 1000;

type HistogramMetricConfig<M extends string, TArgs extends readonly unknown[]> = Omit<HistogramConfiguration<M>, 'name'> & {
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
};

const throwMismatch = (
    metricName: string,
    previous: { readonly buckets?: readonly number[]; readonly labelNames?: readonly string[] },
    next: { readonly buckets?: readonly number[]; readonly labelNames?: readonly string[] }
): never => {
    throw new Error(
        `HistogramMetric "${metricName}" already registered with different buckets/labelNames. ` +
            `Existing: ${JSON.stringify(previous)}. Requested: ${JSON.stringify(next)}. ` +
            `Use a unique name or align configurations.`
    );
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

const createAndRecord = <M extends string>(
    metricName: string,
    configuration: Omit<HistogramConfiguration<M>, 'name'> | undefined,
    registries: readonly Registry[],
    next: { readonly buckets?: readonly number[]; readonly labelNames?: readonly string[] }
): Histogram<M> => {
    const created = new Histogram({
        help: metricName,
        ...configuration,
        name: metricName,
    });
    histogramMetricTracking.record(registries, metricName, next);

    return created;
};

const resolveHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> => {
    const registries = (configuration?.registers ?? [register]) as readonly Registry[];
    const next = { buckets: configuration?.buckets, labelNames: configuration?.labelNames };
    const prior = histogramMetricTracking.find(registries, metricName);
    if (isDefined(prior) && !histogramMetricTracking.configsMatch(prior, next)) {
        throwMismatch(metricName, prior, next);
    }
    const existing = resolveExistingHistogram(metricName, configuration);
    if (isDefined(existing)) {
        if (!isDefined(prior)) {
            histogramMetricTracking.record(registries, metricName, next);
        }

        return existing;
    }

    return createAndRecord(metricName, configuration, registries, next);
};

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
