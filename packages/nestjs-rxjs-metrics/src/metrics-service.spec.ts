import { Logger } from '@nestjs/common';
import { of } from 'rxjs';

import { MetricsServiceMixin } from './metrics-service.mixin';
import { createMetricsRecord } from './util/create-metrics-record.util';

import type { Counter, Gauge, Histogram, Summary } from 'prom-client';

const counterMetrics = { my_counter_metric_label: 'My counter metric description' };
const gaugeMetrics = { my_gauge_metric_label: 'My gauge metric description' };
const histogramMetrics = { my_histogram_metric_label: 'My histogram metric description' };
const summaryMetrics = { my_summary_metric_label: 'My summary metric description' };

const counterRecord = createMetricsRecord<Counter<string>, typeof counterMetrics>('Counter', counterMetrics);
const gaugeRecord = createMetricsRecord<Gauge<string>, typeof gaugeMetrics>('Gauge', gaugeMetrics);
const histogramRecord = createMetricsRecord<Histogram<string>, typeof histogramMetrics>('Histogram', histogramMetrics);
const summaryRecord = createMetricsRecord<Summary<string>, typeof summaryMetrics>('Summary', summaryMetrics);

class NestJSRxJSMetricsService extends MetricsServiceMixin<
    typeof counterMetrics,
    typeof gaugeMetrics,
    typeof histogramMetrics,
    typeof summaryMetrics
>() {}

jest.mock('@willsoto/nestjs-prometheus', () => ({
    getOrCreateMetric: () => ({ inc: jest.fn(), dec: jest.fn(), startTimer: jest.fn() }),
}));
jest.mock('@nestjs/common', () => ({ Logger: { error: jest.fn() } }));

// eslint-disable-next-line max-lines-per-function
describe('NestJSRxJSMetricsService', () => {
    it('counter metric, counter operator, with and without default increment size', async () =>
        await new Promise(resolve => {
            expect.assertions(3);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const counterSpy = jest.spyOn(counterRecord.my_counter_metric_label, 'inc');

            of(true)
                .pipe(service.counter('my_counter_metric_label'))
                .pipe(service.counter('my_counter_metric_label', 2))
                .subscribe(() => {
                    expect(counterSpy).toHaveBeenCalledTimes(2);
                    expect(counterSpy).toHaveBeenCalledWith(1);
                    expect(counterSpy).toHaveBeenCalledWith(2);
                    resolve(true);
                });
        }));

    it('gauge metric, gaugeInc operator, with and without default increment size', async () =>
        await new Promise(resolve => {
            expect.assertions(3);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const gaugeSpy = jest.spyOn(gaugeRecord.my_gauge_metric_label, 'inc');

            of(true)
                .pipe(service.gaugeInc('my_gauge_metric_label'))
                .pipe(service.gaugeInc('my_gauge_metric_label', 2))
                .subscribe(() => {
                    expect(gaugeSpy).toHaveBeenCalledTimes(2);
                    expect(gaugeSpy).toHaveBeenCalledWith(1);
                    expect(gaugeSpy).toHaveBeenCalledWith(2);
                    resolve(true);
                });
        }));

    it('gauge metric, gaugeDec operator, with and without default decrement size', async () =>
        await new Promise(resolve => {
            expect.assertions(3);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const gaugeSpy = jest.spyOn(gaugeRecord.my_gauge_metric_label, 'dec');

            of(true)
                .pipe(service.gaugeDec('my_gauge_metric_label'))
                .pipe(service.gaugeDec('my_gauge_metric_label', 2))
                .subscribe(() => {
                    expect(gaugeSpy).toHaveBeenCalledTimes(2);
                    expect(gaugeSpy).toHaveBeenCalledWith(1);
                    expect(gaugeSpy).toHaveBeenCalledWith(2);
                    resolve(true);
                });
        }));
    it('histogram metric, histogramStart operator', async () =>
        await new Promise(resolve => {
            expect.assertions(1);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const histogramSpy = jest.spyOn(histogramRecord.my_histogram_metric_label, 'startTimer');

            of(true)
                .pipe(service.histogramStart('my_histogram_metric_label'))
                .subscribe(() => {
                    expect(histogramSpy).toHaveBeenCalledWith();
                    resolve(true);
                });
        }));

    it('histogram metric, histogramEnd operator', async () =>
        await new Promise(resolve => {
            expect.assertions(1);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const endTimerFn = jest.fn();
            jest.spyOn(histogramRecord.my_histogram_metric_label, 'startTimer').mockReturnValue(endTimerFn);

            of(true)
                .pipe(service.histogramStart('my_histogram_metric_label'), service.histogramEnd('my_histogram_metric_label'))
                .subscribe(() => {
                    expect(endTimerFn).toHaveBeenCalledWith();
                    resolve(true);
                });
        }));

    it('histogram metric, summaryEnd operator call without start', async () =>
        await new Promise(resolve => {
            expect.assertions(2);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const endTimerFn = jest.fn();
            jest.spyOn(histogramRecord.my_histogram_metric_label, 'startTimer').mockReturnValue(endTimerFn);
            const loggerErrorSpy = jest.spyOn(Logger, 'error');

            of(true)
                .pipe(service.histogramEnd('my_histogram_metric_label'))
                .subscribe(() => {
                    expect(endTimerFn).not.toHaveBeenCalledWith();
                    expect(loggerErrorSpy).toHaveBeenCalledWith(
                        `Cannot end histogram for metric "my_histogram_metric_label" - It was not started`,
                        'MetricsService'
                    );

                    resolve(true);
                });
        }));

    it('summary metric, summaryStart operator', async () =>
        await new Promise(resolve => {
            expect.assertions(1);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const summarySpy = jest.spyOn(summaryRecord.my_summary_metric_label, 'startTimer');

            of(true)
                .pipe(service.summaryStart('my_summary_metric_label'))
                .subscribe(() => {
                    expect(summarySpy).toHaveBeenCalledWith();
                    resolve(true);
                });
        }));

    it('summary metric, summaryEnd operator', async () =>
        await new Promise(resolve => {
            expect.assertions(1);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const endTimerFn = jest.fn();
            jest.spyOn(summaryRecord.my_summary_metric_label, 'startTimer').mockReturnValue(endTimerFn);

            of(true)
                .pipe(service.summaryStart('my_summary_metric_label'), service.summaryEnd('my_summary_metric_label'))
                .subscribe(() => {
                    expect(endTimerFn).toHaveBeenCalledWith();
                    resolve(true);
                });
        }));

    it('summary metric, summaryEnd operator call without start', async () =>
        await new Promise(resolve => {
            expect.assertions(2);

            const service = new NestJSRxJSMetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

            const endTimerFn = jest.fn();
            jest.spyOn(summaryRecord.my_summary_metric_label, 'startTimer').mockReturnValue(endTimerFn);
            const loggerErrorSpy = jest.spyOn(Logger, 'error');

            of(true)
                .pipe(service.summaryEnd('my_summary_metric_label'))
                .subscribe(() => {
                    expect(endTimerFn).not.toHaveBeenCalledWith();
                    expect(loggerErrorSpy).toHaveBeenCalledWith(
                        `Cannot end summary for metric "my_summary_metric_label" - It was not started`,
                        'MetricsService'
                    );

                    resolve(true);
                });
        }));
});
