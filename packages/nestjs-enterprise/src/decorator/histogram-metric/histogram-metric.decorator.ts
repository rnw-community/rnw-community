import { Histogram, type HistogramConfiguration, type LabelValues, type Registry, register } from 'prom-client';

import { createHistogramMetricDecorator } from '@rnw-community/histogram-metric-decorator';
import { isDefined } from '@rnw-community/shared';

import type { HistogramOptionsInterface, HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';

const MS_PER_SECOND = 1000;

type HistogramMetricConfig<M extends string, TArgs extends readonly unknown[]> = Omit<HistogramConfiguration<M>, 'name'> & {
    readonly labels?: (args: TArgs) => Readonly<Record<string, string>>;
};

interface TrackedConfig {
    readonly buckets?: readonly number[];
    readonly labelNames?: readonly string[];
}

const tracking = new WeakMap<Registry, Map<string, TrackedConfig>>();

const bucketsEqual = (a: readonly number[] | undefined, b: readonly number[] | undefined): boolean => {
    if (a === undefined && b === undefined) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    return a.every((value, index) => value === b[index]);
};

const labelNamesEqual = (a: readonly string[] | undefined, b: readonly string[] | undefined): boolean => {
    if (a === undefined && b === undefined) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    if (a.length !== b.length) {
        return false;
    }

    return a.every((value) => b.includes(value));
};

const configsMatch = (previous: TrackedConfig, next: TrackedConfig): boolean =>
    bucketsEqual(previous.buckets, next.buckets) && labelNamesEqual(previous.labelNames, next.labelNames);

const trackRegistration = (registry: Registry, metricName: string, config: TrackedConfig): void => {
    let perRegistry = tracking.get(registry);
    if (!isDefined(perRegistry)) {
        perRegistry = new Map();
        tracking.set(registry, perRegistry);
    }
    perRegistry.set(metricName, config);
};

const findTrackedConfig = (registries: readonly Registry[], metricName: string): TrackedConfig | undefined => {
    for (const registry of registries) {
        const perRegistry = tracking.get(registry);
        const hit = perRegistry?.get(metricName);
        if (isDefined(hit)) {
            return hit;
        }
    }

    return undefined;
};

const throwMismatch = (metricName: string, previous: TrackedConfig, next: TrackedConfig): never => {
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

const resolveHistogram = <M extends string>(
    metricName: string,
    configuration?: Omit<HistogramConfiguration<M>, 'name'>
): Histogram<M> => {
    const registries = (configuration?.registers ?? [register]) as readonly Registry[];
    const next: TrackedConfig = {
        buckets: configuration?.buckets,
        labelNames: configuration?.labelNames,
    };

    const prior = findTrackedConfig(registries, metricName);
    if (isDefined(prior) && !configsMatch(prior, next)) {
        throwMismatch(metricName, prior, next);
    }

    const existing = resolveExistingHistogram(metricName, configuration);
    if (isDefined(existing)) {
        if (!isDefined(prior)) {
            for (const registry of registries) {
                trackRegistration(registry, metricName, next);
            }
        }

        return existing;
    }

    const created = new Histogram({
        help: metricName,
        ...configuration,
        name: metricName,
    });
    for (const registry of registries) {
        trackRegistration(registry, metricName, next);
    }

    return created;
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

export const __resetHistogramTracking = (registry: Registry): void => {
    tracking.delete(registry);
};
