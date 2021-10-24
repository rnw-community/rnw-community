import { isDefined } from '@rnw-community/shared';

import { rxjsOperator } from './util/rxjs-operator.util';

import type { MetricsServiceInterface } from './interface/metrics-service.interface';
import type { HistogramRecord } from './type/histogram-record.type';
import type { MetricConfig } from './type/metrics-config.type';
import type { SummaryRecord } from './type/summary-record.type';
import type { Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { MonoTypeOperatorFunction } from 'rxjs';

export const MetricsServiceMixin = <
    C extends MetricConfig,
    G extends MetricConfig,
    H extends MetricConfig,
    S extends MetricConfig
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(): new (...args: any[]) => MetricsServiceInterface<C, G, H, S> =>
    class CustomMetricsService {
        private readonly startedHistogramMetrics: HistogramRecord<H>;
        private readonly startedSummaryMetrics: SummaryRecord<S>;

        constructor(
            private readonly counterMetrics: Record<keyof C, Counter<string>>,
            private readonly gaugeMetrics: Record<keyof G, Gauge<string>>,
            private readonly histogramMetrics: Record<keyof H, Histogram<string>>,
            private readonly summaryMetrics: Record<keyof S, Summary<string>>
        ) {
            this.startedHistogramMetrics = Object.fromEntries(
                Object.entries(this.histogramMetrics).map(([key]) => [key, undefined])
            ) as HistogramRecord<H>;
            this.startedSummaryMetrics = Object.fromEntries(
                Object.entries(this.summaryMetrics).map(([key]) => [key, undefined])
            ) as SummaryRecord<S>;
        }

        counter<T>(metric: keyof C, value = 1): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                this.counterMetrics[metric].inc(value);
            });
        }

        gauge<T>(metric: keyof G, handler: (gauge: Gauge<string>) => void): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                handler(this.gaugeMetrics[metric]);
            });
        }

        gaugeInc<T>(metric: keyof G, value = 1): MonoTypeOperatorFunction<T> {
            return this.gauge(metric, gauge => void gauge.inc(value));
        }

        gaugeDec<T>(metric: keyof G, value = 1): MonoTypeOperatorFunction<T> {
            return this.gauge(metric, gauge => void gauge.dec(value));
        }

        histogramStart<T>(metric: keyof H): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                this.startedHistogramMetrics[metric] = this.histogramMetrics[metric].startTimer();
            });
        }

        histogramEnd<T>(metric: keyof H): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                const metricEndFn = this.startedHistogramMetrics[metric];

                if (!isDefined(metricEndFn)) {
                    throw new Error(`Cannot end histogram metric ${metric as string} - It was not started`);
                }

                metricEndFn?.();

                this.startedHistogramMetrics[metric] = undefined;
            });
        }

        summaryStart<T>(metric: keyof S): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                this.startedSummaryMetrics[metric] = this.summaryMetrics[metric].startTimer();
            });
        }

        summaryEnd<T>(metric: keyof S): MonoTypeOperatorFunction<T> {
            return rxjsOperator(() => {
                const metricEndFn = this.startedSummaryMetrics[metric];

                if (!isDefined(metricEndFn)) {
                    throw new Error(`Cannot end summary metric ${metric as string} - It was not started`);
                }

                metricEndFn?.();

                this.startedSummaryMetrics[metric] = undefined;
            });
        }
    };
