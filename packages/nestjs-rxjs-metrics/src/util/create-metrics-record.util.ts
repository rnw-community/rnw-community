import { getOrCreateMetric } from '@willsoto/nestjs-prometheus';

import { isDefined } from '@rnw-community/shared';

import type { LabelsConfig } from '../type/labels-config.type';
import type { MetricConfig } from '../type/metrics-config.type';
import type { Metrics } from '@willsoto/nestjs-prometheus';

export const createMetricsRecord = <M, T extends MetricConfig>(
    type: Metrics,
    enumObj: T,
    labelNames?: LabelsConfig<T>
): Record<keyof T, M> =>
    Object.keys(enumObj).reduce<Record<keyof T, M>>(
        (acc, metric) => ({
            ...acc,
            [metric]: getOrCreateMetric(type, {
                name: metric,
                help: enumObj[metric],
                ...(isDefined(labelNames) && { labelNames: Object.keys(labelNames[metric]) }),
            }),
        }),
         
        {} as Record<keyof T, M>
    );
