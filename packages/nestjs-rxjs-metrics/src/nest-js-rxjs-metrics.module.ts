import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { createMetricsRecord } from './util/create-metrics-record.util';

import type { MetricsModuleOptionsInterface } from './interface/metrics-module-options.interface';
import type { MetricConfig } from './type/metrics-config.type';
import type { DynamicModule } from '@nestjs/common';

@Module({})
export class MetricsModule {
    static forRootAsync<C extends MetricConfig, G extends MetricConfig, H extends MetricConfig, S extends MetricConfig>(
        options: MetricsModuleOptionsInterface<C, G, H, S>
    ): DynamicModule {
        const { counterMetrics, gaugeMetrics, histogramMetrics, summaryMetrics, ...nestjsPrometheusOptions } = options;

        return {
            ...options,
            imports: [PrometheusModule.register(nestjsPrometheusOptions), ...(options.imports ?? [])],
            module: MetricsModule,
            providers: [
                {
                    provide: 'COUNTER',
                    useValue: createMetricsRecord('Counter', counterMetrics),
                },
                {
                    provide: 'GAUGE',
                    useValue: createMetricsRecord('Gauge', gaugeMetrics),
                },
                {
                    provide: 'HISTOGRAM',
                    useValue: createMetricsRecord('Histogram', histogramMetrics),
                },
                {
                    provide: 'SUMMARY',
                    useValue: createMetricsRecord('Summary', summaryMetrics),
                },
                ...(options.providers ?? []),
            ],
        };
    }
}
