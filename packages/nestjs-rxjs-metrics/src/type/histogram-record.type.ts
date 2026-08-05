import type { MetricConfig } from './metrics-config.type.js';
import type { Histogram } from 'prom-client';

export type HistogramRecord<H extends MetricConfig> = Record<keyof H, ReturnType<Histogram['startTimer']>[]>;
