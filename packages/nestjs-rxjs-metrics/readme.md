# NestJS RxJS metrics

NestJS prometheus metrics wrapper for using with RxJS streams.

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

-   Create metrics service for NestJS DI, this service should be used in the project:

```ts
import { Inject, Injectable } from '@nestjs/common';

import { MetricsServiceMixin } from '@rnw-community/nestjs-rxjs-metrics';

import type { counterMetrics } from './counter.metrics';
import type { gaugeMetrics } from './gauge.metrics';
import type { histogramMetrics } from './histogram.metrics';
import type { summaryMetrics } from './summary.metrics';

@Injectable()
export class MetricsService extends MetricsServiceMixin<
    typeof counterMetrics,
    typeof gaugeMetrics,
    typeof histogramMetrics,
    typeof summaryMetrics
>() {
    constructor(
        @Inject('COUNTER') counter: typeof counterMetrics,
        @Inject('GAUGE') gauge: typeof gaugeMetrics,
        @Inject('HISTOGRAM') histogram: typeof histogramMetrics,
        @Inject('SUMMARY') summary: typeof summaryMetrics
    ) {
        super(counter, gauge, histogram, summary);
    }
}
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
