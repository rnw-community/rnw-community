import { describe, expect, it, jest } from '@jest/globals';

import { NestJSRxJSMetricsModule } from './nestjs-rxjs-metrics.module';
import { createMetricsRecord } from './util/create-metrics-record.util';

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

jest.mock('@willsoto/nestjs-prometheus', () => ({
    getOrCreateMetric: () => ({ inc: jest.fn(), dec: jest.fn(), startTimer: jest.fn() }),
    PrometheusModule: { register: jest.fn() },
}));

describe('NestJSRxJSMetricsModule', () => {
    it('should create typed metrics module without labels', () => {
        expect.assertions(3);

        const [MetricsModule, MetricsService] = NestJSRxJSMetricsModule.create({
            counterMetrics,
            gaugeMetrics,
            histogramMetrics,
            summaryMetrics,
        });

        const counterRecord = createMetricsRecord<Counter, typeof counterMetrics>('Counter', counterMetrics);
        const gaugeRecord = createMetricsRecord<Gauge, typeof gaugeMetrics>('Gauge', gaugeMetrics);
        const histogramRecord = createMetricsRecord<Histogram, typeof histogramMetrics>('Histogram', histogramMetrics);
        const summaryRecord = createMetricsRecord<Summary, typeof summaryMetrics>('Summary', summaryMetrics);

        const metrics = new MetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

        metrics.histogramStart('my_histogram_metric');
        metrics.summaryStart('my_summary_metric');

        expect(MetricsModule.exports).toContain(MetricsService);
        expect(MetricsModule.providers).toContain(MetricsService);
        expect(typeof MetricsService === 'function').toBeTruthy();
    });

    it('should create typed metrics module with labels', () => {
        expect.assertions(3);

        const [MetricsModule, MetricsService] = NestJSRxJSMetricsModule.create({
            counterMetrics,
            gaugeMetrics,
            histogramMetrics,
            summaryMetrics,
            histogramLabels,
            summaryLabels,
        });

        const counterRecord = createMetricsRecord<Counter, typeof counterMetrics>('Counter', counterMetrics);
        const gaugeRecord = createMetricsRecord<Gauge, typeof gaugeMetrics>('Gauge', gaugeMetrics);
        const histogramRecord = createMetricsRecord<Histogram, typeof histogramMetrics>(
            'Histogram',
            histogramMetrics,
            histogramLabels
        );
        const summaryRecord = createMetricsRecord<Summary, typeof summaryMetrics>('Summary', summaryMetrics, summaryLabels);

        const metrics = new MetricsService(counterRecord, gaugeRecord, histogramRecord, summaryRecord);

        metrics.histogramStart('my_histogram_metric', { my_histogram_metric_label: 1 });
        metrics.summaryStart('my_summary_metric', { my_summary_label: 1 });

        expect(MetricsModule.exports).toContain(MetricsService);
        expect(MetricsModule.providers).toContain(MetricsService);
        expect(typeof MetricsService === 'function').toBeTruthy();
    });
});
