# NestJS RxJS metrics

NestJS prometheus metrics wrapper for using with RxJS streams.

## TODO

-   Add module `create` unit tests
-   Finish docs with operator examples

## Installation

Install additional peer dependencies:

-   [prom-client](https://github.com/siimon/prom-client)
-   [nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)

## Configuration

-   Create custom metrics objects for each type of metrics, this is needed for safe TS usage inside the service operators:

```ts
export const counterMetrics = { my_counter_metric_label: 'My counter metric description' };
export const gaugeMetrics = { my_gauge_metric_label: 'My gauge metric description' };
export const histogramMetrics = { my_histogram_metric_label: 'My histogram metric description' };
export const summaryMetrics = { my_summary_metric_label: 'My summary metric description' };
```

-   Create metrics module and service for NestJS DI, this module and service should be used in the project:

```ts
import { Inject, Injectable } from '@nestjs/common';

import { MetricsServiceMixin } from '@rnw-community/nestjs-rxjs-metrics';

import type { counterMetrics } from './counter.metrics';
import type { gaugeMetrics } from './gauge.metrics';
import type { histogramMetrics } from './histogram.metrics';
import type { summaryMetrics } from './summary.metrics';

export const [BaseMetricsModule, BaseMetricsService] = NestJSRxJSMetricsModule.create({
    counterMetrics,
    gaugeMetrics,
    histogramMetrics,
    summaryMetrics,
    controller: PrometheusController,
});

@Injectable()
export class MetricsService extends BaseMetricsService {}

@Module({
    imports: [BaseMetricsModule],
    providers: [MetricsService],
    exports: [MetricsService],
})
export class MetricsModule {}
```

## Usage

### counter operator

### gauge operator

### gaugeInc operator

### gaugeDec operator

### histogramStart operator

### histogramEnd operator

### summaryStart operator

### summaryEnd operator
