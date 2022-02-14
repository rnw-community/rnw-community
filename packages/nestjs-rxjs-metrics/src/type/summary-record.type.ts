import type { MetricConfig } from './metrics-config.type';
import type { Summary } from 'prom-client';

export type SummaryRecord<S extends MetricConfig> = Record<keyof S, Array<ReturnType<Summary<string>['startTimer']>>>;
