import { Logger } from '@nestjs/common';

import { isDefined } from '@rnw-community/shared';

import { rxjsOperator } from '../util/rxjs-operator.util';

import type { HistogramRecord } from '../type/histogram-record.type';
import type { LabelsConfig } from '../type/labels-config.type';
import type { MetricConfig as MC } from '../type/metrics-config.type';
import type { SummaryRecord } from '../type/summary-record.type';
import type { Counter, Gauge, Histogram, LabelValues, Summary } from 'prom-client';
import type { MonoTypeOperatorFunction } from 'rxjs';

type ValuesOf<T extends readonly string[]> = T[number];

/**
 * The service base class exposing RxJS operators that update Prometheus metrics as stream values pass through, obtained from `NestJSRxJSMetricsModule.create`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#nestjsrxjsmetricsservice
 */
export class NestJSRxJSMetricsService<
    C extends MC,
    G extends MC,
    H extends MC,
    S extends MC,
    HL extends LabelsConfig<H> = LabelsConfig<H>,
    SL extends LabelsConfig<S> = LabelsConfig<S>,
> {
    protected readonly startedHistogramMetrics: HistogramRecord<H>;
    protected readonly startedSummaryMetrics: SummaryRecord<S>;

    constructor(
        protected readonly counterMetrics: Record<keyof C, Counter>,
        protected readonly gaugeMetrics: Record<keyof G, Gauge>,
        protected readonly histogramMetrics: Record<keyof H, Histogram>,
        protected readonly summaryMetrics: Record<keyof S, Summary>
    ) {
        this.startedHistogramMetrics = Object.fromEntries(
            Object.entries(this.histogramMetrics).map(([key]) => [key, []])
        ) as unknown as HistogramRecord<H>;

        this.startedSummaryMetrics = Object.fromEntries(
            Object.entries(this.summaryMetrics).map(([key]) => [key, []])
        ) as unknown as SummaryRecord<S>;
    }

    /**
     * Pipeable operator incrementing the counter metric by `value` (1 by default) for each emitted value.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#counter
     */
    counter<T>(metric: keyof C, value = 1): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            this.counterMetrics[metric].inc(value);
        });
    }

    /**
     * Pipeable operator calling `handler` with the gauge metric for each emitted value.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#gauge
     */
    gauge<T>(metric: keyof G, handler: (gauge: Gauge) => void): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            handler(this.gaugeMetrics[metric]);
        });
    }

    /**
     * Pipeable operator incrementing the gauge metric by `value` (1 by default) for each emitted value.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#gauge
     */
    gaugeInc<T>(metric: keyof G, value = 1): MonoTypeOperatorFunction<T> {
        return this.gauge(metric, gauge => void gauge.inc(value));
    }

    /**
     * Pipeable operator decrementing the gauge metric by `value` (1 by default) for each emitted value.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#gauge
     */
    gaugeDec<T>(metric: keyof G, value = 1): MonoTypeOperatorFunction<T> {
        return this.gauge(metric, gauge => void gauge.dec(value));
    }

    /**
     * Pipeable operator starting a histogram timer for each emitted value, to be ended by `histogramEnd`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#histogram
     */
    histogramStart<T>(metric: keyof H, labels?: LabelValues<ValuesOf<HL[keyof H]>>): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            this.startedHistogramMetrics[metric].push(this.histogramMetrics[metric].startTimer(labels));
        });
    }

    /**
     * Pipeable operator ending the most recently started histogram timer for each emitted value, logging an error when none was started.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#histogram
     */
    histogramEnd<T>(metric: keyof H, labels?: LabelValues<ValuesOf<HL[keyof H]>>): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            const metricEndFn = this.startedHistogramMetrics[metric].pop();

            if (isDefined(metricEndFn)) {
                metricEndFn(labels);
            } else {
                Logger.error(
                    `Cannot end histogram for metric "${metric as string}" - It was not started`,
                    NestJSRxJSMetricsService.name
                );
            }
        });
    }

    /**
     * Pipeable operator starting a summary timer for each emitted value, to be ended by `summaryEnd`.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#summary
     */
    summaryStart<T>(metric: keyof S, labels?: LabelValues<ValuesOf<SL[keyof S]>>): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            this.startedSummaryMetrics[metric].push(this.summaryMetrics[metric].startTimer(labels));
        });
    }

    /**
     * Pipeable operator ending the most recently started summary timer for each emitted value, logging an error when none was started.
     *
     * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-rxjs-metrics/readme.md#summary
     */
    summaryEnd<T>(metric: keyof S, labels?: LabelValues<ValuesOf<SL[keyof S]>>): MonoTypeOperatorFunction<T> {
        return rxjsOperator(() => {
            const metricEndFn = this.startedSummaryMetrics[metric].pop();

            if (isDefined(metricEndFn)) {
                metricEndFn(labels);
            } else {
                Logger.error(
                    `Cannot end summary for metric "${metric as string}" - It was not started`,
                    NestJSRxJSMetricsService.name
                );
            }
        });
    }
}
