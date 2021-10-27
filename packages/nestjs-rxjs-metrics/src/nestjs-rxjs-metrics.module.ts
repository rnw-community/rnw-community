// eslint-disable-next-line max-classes-per-file
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { NestJSRxJSMetricsService } from './nestjs-rxjs-metrics-service/nestjs-rxjs-metrics.service';
import { createMetricsRecord } from './util/create-metrics-record.util';

import type { MetricsModuleOptionsInterface } from './interface/metrics-module-options.interface';
import type { MetricConfig as MC } from './type/metrics-config.type';
import type { DynamicModule, Type } from '@nestjs/common';

@Module({})
export class NestJSRxJSMetricsModule {
    /**
     * Create module and strongly typed service class for extension.
     *
     * @param options Metrics configuration object
     * @return [DynamicModule, Type<NestJSRxJSMetricsService<C, G, H, S>>] Tuple with typed dynamic module and service class for extending
     */
    static create<C extends MC, G extends MC, H extends MC, S extends MC>(
        options: MetricsModuleOptionsInterface<C, G, H, S>
    ): [DynamicModule, Type<NestJSRxJSMetricsService<C, G, H, S>>] {
        const { counterMetrics, gaugeMetrics, histogramMetrics, summaryMetrics, ...nestjsPrometheusOptions } = options;

        class MetricsService extends NestJSRxJSMetricsService<C, G, H, S> {
            constructor() {
                super(
                    createMetricsRecord('Counter', counterMetrics),
                    createMetricsRecord('Gauge', gaugeMetrics),
                    createMetricsRecord('Histogram', histogramMetrics),
                    createMetricsRecord('Summary', summaryMetrics)
                );
            }
        }

        const MetricsModule = {
            imports: [PrometheusModule.register(nestjsPrometheusOptions)],
            module: NestJSRxJSMetricsModule,
            providers: [MetricsService],
            exports: [MetricsService],
        };

        return [MetricsModule, MetricsService];
    }
}
