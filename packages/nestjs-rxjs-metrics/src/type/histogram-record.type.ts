import type { MetricConfig } from './metrics-config.type';
import type { Histogram } from 'prom-client';

export type HistogramRecord<H extends MetricConfig> = Record<
    keyof H,
    ReturnType<Histogram<string>['startTimer']> | undefined
>;
