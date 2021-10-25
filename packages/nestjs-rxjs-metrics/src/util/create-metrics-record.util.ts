import { getOrCreateMetric } from '@willsoto/nestjs-prometheus';

import type { MetricConfig } from '../type/metrics-config.type';
import type { Metrics } from '@willsoto/nestjs-prometheus';

export const createMetricsRecord = <M, T extends MetricConfig>(type: Metrics, enumObj: T): Record<keyof T, M> =>
    Object.keys(enumObj).reduce(
        (acc, metric) => ({ ...acc, [metric]: getOrCreateMetric(type, { name: metric, help: enumObj[metric] }) }),
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions,@typescript-eslint/prefer-reduce-type-parameter
        {} as Record<keyof T, M>
    );
