import type { MetricConfig } from '../type/metrics-config.type';
import type { Gauge } from 'prom-client';
import type { MonoTypeOperatorFunction } from 'rxjs';

export interface MetricsServiceInterface<
    C extends MetricConfig,
    G extends MetricConfig,
    H extends MetricConfig,
    S extends MetricConfig
> {
    counter: <T>(metric: keyof C, value?: number) => MonoTypeOperatorFunction<T>;
    gauge: <T>(metric: keyof G, handler: (gauge: Gauge<string>) => void) => MonoTypeOperatorFunction<T>;
    gaugeInc: <T>(metric: keyof G, value?: number) => MonoTypeOperatorFunction<T>;
    gaugeDec: <T>(metric: keyof G, value?: number) => MonoTypeOperatorFunction<T>;
    histogramStart: <T>(metric: keyof H) => MonoTypeOperatorFunction<T>;
    histogramEnd: <T>(metric: keyof H) => MonoTypeOperatorFunction<T>;
    summaryStart: <T>(metric: keyof S) => MonoTypeOperatorFunction<T>;
    summaryEnd: <T>(metric: keyof S) => MonoTypeOperatorFunction<T>;
}
