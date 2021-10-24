import { MetricConfig } from './metrics-config.type';
import { Summary } from 'prom-client';

export type SummaryRecord<S extends MetricConfig> = Record<keyof S, ReturnType<Summary<string>['startTimer']> | undefined>;
