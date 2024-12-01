/* eslint-disable */
import { describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import { of } from 'rxjs';

import { createMetricsRecord } from '../util/create-metrics-record.util';

import { NestJSRxJSMetricsService } from './nestjs-rxjs-metrics.service';

import type { Counter, Gauge, Histogram, Summary } from 'prom-client';

const counterMetrics = { my_counter_metric: 'My counter metric description' };
const gaugeMetrics = { my_gauge_metric: 'My gauge metric description' };
const histogramMetrics = { my_histogram_metric: 'My histogram metric description' };
const summaryMetrics = { my_summary_metric: 'My summary metric description' };

const histogramLabels = {
    my_histogram_metric: ['my_histogram_metric_label'] as const,
};

const summaryLabels = {
    my_summary_metric: ['my_summary_label'] as const,
};

const counterRecord = createMetricsRecord<Counter, typeof counterMetrics>('Counter', counterMetrics);
const gaugeRecord = createMetricsRecord<Gauge, typeof gaugeMetrics>('Gauge', gaugeMetrics);
const histogramRecord = createMetricsRecord<Histogram, typeof histogramMetrics>(
    'Histogram',
    histogramMetrics,
    histogramLabels
);
const summaryRecord = createMetricsRecord<Summary, typeof summaryMetrics>('Summary', summaryMetrics, summaryLabels);

const endTimerFn = jest.fn<(labels?: Partial<Record<string, number | string>> | undefined) => number>();

class MetricsService extends NestJSRxJSMetricsService<
    typeof counterMetrics,
    typeof gaugeMetrics,
    typeof histogramMetrics,
    typeof summaryMetrics,
    typeof histogramLabels,
    typeof summaryLabels
> {
    constructor() {
        super(counterRecord, gaugeRecord, histogramRecord, summaryRecord);
    }
}

jest.mock('@willsoto/nestjs-prometheus', () => ({
    getOrCreateMetric: () => ({ inc: jest.fn(), dec: jest.fn(), startTimer: jest.fn() }),
}));
jest.mock('@nestjs/common', () => ({ Logger: { error: jest.fn() } }));

// eslint-disable-next-line max-lines-per-function
describe('NestJSRxJSMetricsService', () => {
    it('counter metric, counter operator, with and without default increment size', done => {
        expect.assertions(3);

        const service = new MetricsService();

        const counterSpy = jest.spyOn(counterRecord.my_counter_metric, 'inc');

        of(true)
            .pipe(service.counter('my_counter_metric'))
            .pipe(service.counter('my_counter_metric', 2))
            .subscribe(() => {
                expect(counterSpy).toHaveBeenCalledTimes(2);
                expect(counterSpy).toHaveBeenCalledWith(1);
                expect(counterSpy).toHaveBeenCalledWith(2);

                done();
            });
    });

    it('gauge metric, gaugeInc operator, with and without default increment size', done => {
        expect.assertions(3);

        const service = new MetricsService();

        const gaugeSpy = jest.spyOn(gaugeRecord.my_gauge_metric, 'inc');

        of(true)
            .pipe(service.gaugeInc('my_gauge_metric'))
            .pipe(service.gaugeInc('my_gauge_metric', 2))
            .subscribe(() => {
                expect(gaugeSpy).toHaveBeenCalledTimes(2);
                expect(gaugeSpy).toHaveBeenCalledWith(1);
                expect(gaugeSpy).toHaveBeenCalledWith(2);

                done();
            });
    });

    it('gauge metric, gaugeDec operator, with and without default decrement size', done => {
        expect.assertions(3);

        const service = new MetricsService();

        const gaugeSpy = jest.spyOn(gaugeRecord.my_gauge_metric, 'dec');

        of(true)
            .pipe(service.gaugeDec('my_gauge_metric'))
            .pipe(service.gaugeDec('my_gauge_metric', 2))
            .subscribe(() => {
                expect(gaugeSpy).toHaveBeenCalledTimes(2);
                expect(gaugeSpy).toHaveBeenCalledWith(1);
                expect(gaugeSpy).toHaveBeenCalledWith(2);

                done();
            });
    });

    it('histogram metric, histogramStart operator', done => {
        expect.assertions(1);

        const service = new MetricsService();

        const histogramSpy = jest.spyOn(histogramRecord.my_histogram_metric, 'startTimer');

        of(true)
            .pipe(service.histogramStart('my_histogram_metric'))
            .subscribe(() => {
                expect(histogramSpy).toHaveBeenCalledWith(undefined);

                done();
            });
    });

    it('histogram metric, histogramEnd operator', done => {
        expect.assertions(1);

        const service = new MetricsService();

        jest.spyOn(histogramRecord.my_histogram_metric, 'startTimer').mockReturnValue(endTimerFn);

        of(true)
            .pipe(service.histogramStart('my_histogram_metric'), service.histogramEnd('my_histogram_metric'))
            .subscribe(() => {
                expect(endTimerFn).toHaveBeenCalledWith(undefined);

                done();
            });
    });

    it('histogram metric, histogramEnd operator call without start', done => {
        expect.assertions(2);

        const service = new MetricsService();

        jest.spyOn(histogramRecord.my_histogram_metric, 'startTimer').mockReturnValue(endTimerFn);
        const loggerErrorSpy = jest.spyOn(Logger, 'error');

        of(true)
            .pipe(service.histogramEnd('my_histogram_metric'))
            .subscribe(() => {
                expect(endTimerFn).not.toHaveBeenCalledWith();
                expect(loggerErrorSpy).toHaveBeenCalledWith(
                    `Cannot end histogram for metric "my_histogram_metric" - It was not started`,
                    'NestJSRxJSMetricsService'
                );

                done();
            });
    });

    it('histogram metric with labels', done => {
        expect.assertions(2);

        const service = new MetricsService();

        const histogramSpy = jest.spyOn(histogramRecord.my_histogram_metric, 'startTimer');
        jest.spyOn(histogramRecord.my_histogram_metric, 'startTimer').mockReturnValue(endTimerFn);

        of(true)
            .pipe(
                service.histogramStart('my_histogram_metric', { my_histogram_metric_label: 1 }),
                service.histogramEnd('my_histogram_metric', { my_histogram_metric_label: 2 })
            )
            .subscribe(() => {
                expect(histogramSpy).toHaveBeenCalledWith({ my_histogram_metric_label: 1 });
                expect(endTimerFn).toHaveBeenCalledWith({ my_histogram_metric_label: 2 });

                done();
            });
    });

    it('summary metric, summaryStart operator', done => {
        expect.assertions(1);

        const service = new MetricsService();

        const summarySpy = jest.spyOn(summaryRecord.my_summary_metric, 'startTimer');

        of(true)
            .pipe(service.summaryStart('my_summary_metric'))
            .subscribe(() => {
                expect(summarySpy).toHaveBeenCalledWith(undefined);

                done();
            });
    });

    it('summary metric, summaryEnd operator', done => {
        expect.assertions(1);

        const service = new MetricsService();

        jest.spyOn(summaryRecord.my_summary_metric, 'startTimer').mockReturnValue(endTimerFn);

        of(true)
            .pipe(service.summaryStart('my_summary_metric'), service.summaryEnd('my_summary_metric'))
            .subscribe(() => {
                expect(endTimerFn).toHaveBeenCalledWith(undefined);

                done();
            });
    });

    it('summary metric, summaryEnd operator call without start', done => {
        expect.assertions(2);

        const service = new MetricsService();

        endTimerFn.mockReset();
        jest.spyOn(summaryRecord.my_summary_metric, 'startTimer').mockReturnValue(endTimerFn);
        const loggerErrorSpy = jest.spyOn(Logger, 'error');

        of(true)
            .pipe(service.summaryEnd('my_summary_metric'))
            .subscribe(() => {
                expect(endTimerFn).not.toHaveBeenCalledWith(undefined);
                expect(loggerErrorSpy).toHaveBeenCalledWith(
                    `Cannot end summary for metric "my_summary_metric" - It was not started`,
                    'NestJSRxJSMetricsService'
                );

                done();
            });
    });

    it('summary metric with labels', done => {
        expect.assertions(2);

        const service = new MetricsService();

        const summarySpy = jest.spyOn(summaryRecord.my_summary_metric, 'startTimer');
        jest.spyOn(summaryRecord.my_summary_metric, 'startTimer').mockReturnValue(endTimerFn);

        of(true)
            .pipe(
                service.summaryStart('my_summary_metric', { my_summary_label: 0 }),
                service.summaryEnd('my_summary_metric', { my_summary_label: 1 })
            )
            .subscribe(() => {
                expect(summarySpy).toHaveBeenCalledWith({ my_summary_label: 0 });
                expect(endTimerFn).toHaveBeenCalledWith({ my_summary_label: 1 });

                done();
            });
    });
});
