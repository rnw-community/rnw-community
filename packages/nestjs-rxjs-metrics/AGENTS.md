# @rnw-community/nestjs-rxjs-metrics

Prometheus metrics as RxJS pipeable operators for NestJS. Counters, gauges, histograms (start/end timer), and summaries.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  interface/                    — MetricsModuleOptionsInterface
  nestjs-rxjs-metrics-service/  — NestJSRxJSMetricsService (generic base class)
  type/                         — HistogramRecord, SummaryRecord, LabelsConfig, MetricConfig
  util/                         — createMetricsRecord, rxjsOperator (shared concatMap pass-through)
  nestjs-rxjs-metrics.module.ts — NestJSRxJSMetricsModule with create() factory
```

### Key Patterns

- `NestJSRxJSMetricsModule.create<C,G,H,S,...>(options)` returns `[DynamicModule, Type<MetricsService>]`
- `MetricConfig = Record<string, string>` where keys are metric names, values are help descriptions
- Timer-based metrics (histogram/summary) use internal stacks to pair `startTimer`/`endTimer` across operators
- All operator methods use shared `rxjsOperator` utility: `concatMap` pass-through with void side-effect
- Built on `@willsoto/nestjs-prometheus` (`getOrCreateMetric`)

### Dependencies

Peers: `@nestjs/common`, `@willsoto/nestjs-prometheus`, `prom-client`, `rxjs`. Internal: `@rnw-community/shared`.

### Coverage

Default: **99.9%** all metrics.
