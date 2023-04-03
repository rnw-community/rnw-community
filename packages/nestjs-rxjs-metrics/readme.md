# NestJS RxJS metrics

NestJS prometheus metrics wrapper for using with RxJS streams with full TypeScript support.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-metrics.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-metrics)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-metrics.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-metrics)

## Installation

Install additional peer dependencies:

-   [prom-client](https://github.com/siimon/prom-client)
-   [nestjs-prometheus](https://github.com/willsoto/nestjs-prometheus)

## Configuration

-   Create custom metrics objects for each type of metrics, this is needed for safe TS usage inside the service operators:

```ts
export const counterMetrics = { my_counter_metric: 'My counter metric description' };
export const gaugeMetrics = { my_gauge_metric: 'My gauge metric description' };
export const histogramMetrics = { my_histogram_metric: 'My histogram metric description' };
export const summaryMetrics = { my_summary_metric: 'My summary metric description' };
```

-   Create custom histogram and summary metrics labels objects, this is needed for safe TS usage inside the service operators:

> Using `[...] as const is important for TS type checking to work`

```ts
const histogramLabels = {
    my_histogram_metric: ['my_histogram_metric_label'] as const,
};

const summaryLabels = {
    my_summary_metric: ['my_summary_label'] as const,
};
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
    summaryLabels,
    histogramLabels,
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

This package provides a set of [RxJS](https://rxjs.dev) operators for beautiful usage of prometheus metrics inside the streams.
Take a look at best practises and other useful docs from official [prometheus documentation](https://prometheus.io/docs/introduction/overview/).

### Counter

[Counter](https://prometheus.io/docs/concepts/metric_types/#counter) supports next operator:

-   `counter(CounterMetric, value = 1)` operator - increment counter metric by `value`

```ts
const counterMetrics = { my_counter_metric: 'Text counter metric' };

@Injectable()
export class MyService {
    constructor(private readonly metrics: MetricsService) {}

    externalAction$() {
        return of(true).pipe(
            // perform actions
            this.metrics.counter('my_counter_metric' /* defaut value is 1, you can proide another number */)
        );
    }
}
```

### Gauge

[Gauge](https://prometheus.io/docs/concepts/metric_types/#gauge) supports next operators:

-   `gauge(GaugeMetric, handler: (gauge: Gauge<string>) => void)` operator - observe Gauge metric and perform callback on it
-   `gaugeInc(GaugeMetric, value = 1) => void)` operator - increment Gauge metric by `value`
-   `gaugeDec(GaugeMetric, value = 1) => void)` operator - decrement Gauge metric by `value`

```ts
const gaugeMetrics = { my_gauge_metric: 'Text gauge metric' };

@Injectable()
export class MyService {
    constructor(private readonly metrics: MetricsService) {}

    activateAction$() {
        return of(true).pipe(
            // perform actions
            this.metrics.gaugeInc('my_gauge_metric' /* defaut value is 1, you can proide another number */)
        );
    }

    deactivateAction$() {
        return of(true).pipe(
            // perform actions
            this.metrics.gaugeDec('my_gauge_metric' /* defaut value is 1, you can proide another number */)
        );
    }
}
```

### Histogram

[Histogram](https://prometheus.io/docs/concepts/metric_types/#histogram) supports next operators:

-   `histogramStart(HistogramMetric, labels?: LabelValues<L>)` operator - start observing Histogram metric with labels
-   `histogramEnd(HistogramMetric, labels?: LabelValues<L>))` operator - finish observing Histogram metric with labels

```ts
const histogramMetrics = { my_histogram_metric: 'Text histogram metric' };
const histogramLabels = { my_histogram_metric: ['my_histogram_metric_label1'] as const };

@Injectable()
export class MyService {
    constructor(private readonly metrics: MetricsService) {}

    exampleAction$() {
        return of(true).pipe(
            this.metrics.histogramStart('my_histogram_metric', { my_histogram_metric_label1: 1 }),
            // perform actions
            this.metrics.histogramEnd('my_histogram_metric', { my_histogram_metric_label1: 2 })
        );
    }
}
```

### Summary

[Summary](https://prometheus.io/docs/concepts/metric_types/#summary) supports next operators:

-   `histogramStart(SumaryMetric, labels?: LabelValues<L>)` operator - start observing Summary metric with labels
-   `histogramEnd(SummaryMetric, labels?: LabelValues<L>))` operator - finish observing Summary metric with labels

```ts
const summaryMetrics = { my_summary_metric: 'Text summary metric' };
const summaryLabels = { my_summary_metric: ['my_summary_metric_label1'] as const };

@Injectable()
export class MyService {
    constructor(private readonly metrics: MetricsService) {}

    exampleAction$() {
        return of(true).pipe(
            this.metrics.histogramStart('my_summary_metric', { my_summary_metric_label1: 1 }),
            // perform actions
            this.metrics.histogramEnd('my_summary_metric', { my_summary_metric_label1: 2 })
        );
    }
}
```
