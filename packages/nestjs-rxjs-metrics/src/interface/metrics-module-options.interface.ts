import type { LabelsConfig } from '../type/labels-config.type';
import type { MetricConfig } from '../type/metrics-config.type';
import type { PrometheusOptions } from '@willsoto/nestjs-prometheus';

export interface MetricsModuleOptionsInterface<
    C extends MetricConfig,
    G extends MetricConfig,
    H extends MetricConfig,
    S extends MetricConfig,
    HL extends LabelsConfig<H> = LabelsConfig<H>,
    SL extends LabelsConfig<S> = LabelsConfig<S>
> extends PrometheusOptions {
    counterMetrics: C;
    gaugeMetrics: G;
    histogramLabels?: HL;
    histogramMetrics: H;
    summaryLabels?: SL;
    summaryMetrics: S;
}
