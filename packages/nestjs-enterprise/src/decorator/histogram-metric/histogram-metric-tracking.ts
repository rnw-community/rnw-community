import { isDefined } from '@rnw-community/shared';

import type { Registry } from 'prom-client';

interface HistogramMetricTrackedConfig {
    readonly buckets?: readonly number[];
    readonly labelNames?: readonly string[];
}

interface HistogramMetricTrackingApi {
    readonly find: (registries: readonly Registry[], metricName: string) => HistogramMetricTrackedConfig | undefined;
    readonly record: (registries: readonly Registry[], metricName: string, config: HistogramMetricTrackedConfig) => void;
    readonly configsMatch: (previous: HistogramMetricTrackedConfig, next: HistogramMetricTrackedConfig) => boolean;
    readonly reset: (registry: Registry) => void;
}

const registryMap = new WeakMap<Registry, Map<string, HistogramMetricTrackedConfig>>();

const bucketsEqual = (first: readonly number[] | undefined, second: readonly number[] | undefined): boolean => {
    if (!isDefined(first) && !isDefined(second)) {
        return true;
    }
    if (!isDefined(first) || !isDefined(second)) {
        return false;
    }
    if (first.length !== second.length) {
        return false;
    }

    return first.every((value, index) => value === second[index]);
};

const labelNamesEqual = (first: readonly string[] | undefined, second: readonly string[] | undefined): boolean => {
    if (!isDefined(first) && !isDefined(second)) {
        return true;
    }
    if (!isDefined(first) || !isDefined(second)) {
        return false;
    }
    if (first.length !== second.length) {
        return false;
    }
    const sortedFirst = [...first].sort((left, right) => left.localeCompare(right));
    const sortedSecond = [...second].sort((left, right) => left.localeCompare(right));

    return sortedFirst.every((value, index) => value === sortedSecond[index]);
};

export const histogramMetricTracking: HistogramMetricTrackingApi = {
    find: (registries, metricName) => {
        for (const registry of registries) {
            const perRegistry = registryMap.get(registry);
            const hit = perRegistry?.get(metricName);
            if (isDefined(hit)) {
                return hit;
            }
        }

        return void 0;
    },
    record: (registries, metricName, config) => {
        for (const registry of registries) {
            let perRegistry = registryMap.get(registry);
            if (!isDefined(perRegistry)) {
                perRegistry = new Map();
                registryMap.set(registry, perRegistry);
            }
            perRegistry.set(metricName, config);
        }
    },
    configsMatch: (previous, next) =>
        bucketsEqual(previous.buckets, next.buckets) && labelNamesEqual(previous.labelNames, next.labelNames),
    reset: (registry) => {
        registryMap.delete(registry);
    },
};
