import { Logger } from '@nestjs/common';

import { isDefined } from '@rnw-community/shared';

import { rxjsOperator } from '../util/rxjs-operator.util';

import type { MetricsServiceInterface } from '../interface/metrics-service.interface';
import type { HistogramRecord } from '../type/histogram-record.type';
import type { MetricConfig as MC } from '../type/metrics-config.type';
import type { SummaryRecord } from '../type/summary-record.type';
import type { Counter, Gauge, Histogram, Summary } from 'prom-client';
import type { MonoTypeOperatorFunction } from 'rxjs';

export class NestJSRxJSMetricsService<C extends MC, G extends MC, H extends MC, S extends MC>
    implements MetricsServiceInterface<C, G, H, S>
{
    protected readonly startedHistogramMetrics: HistogramRecord<H>;
    protected readonly startedSummaryMetrics: SummaryRecord<S>;

    constructor(
        protected readonly counterMetrics: Record<keyof C, Counter<string>>,
        protected readonly gaugeMetrics: Record<keyof G, Gauge<string>>,
        protected readonly histogramMetrics: Record<keyof H, Histogram<string>>,
        protected readonly summaryMetrics: Record<keyof S, Summary<string>>
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

            if (isDefined(metricEndFn)) {
                metricEndFn?.();

                this.startedHistogramMetrics[metric] = undefined;
            } else {
                Logger.error(
                    `Cannot end histogram for metric "${metric as string}" - It was not started`,
                    NestJSRxJSMetricsService.name
                );
            }
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

            if (isDefined(metricEndFn)) {
                metricEndFn?.();

                this.startedSummaryMetrics[metric] = undefined;
            } else {
                Logger.error(
                    `Cannot end summary for metric "${metric as string}" - It was not started`,
                    NestJSRxJSMetricsService.name
                );
            }
        });
    }
}
