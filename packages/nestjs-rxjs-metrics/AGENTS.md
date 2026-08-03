# @rnw-community/nestjs-rxjs-metrics

Prometheus metrics as RxJS pipeable operators for NestJS. Counters, gauges, histograms (start/end timer), and summaries.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  index.ts                                — barrel: module, service
  nestjs-rxjs-metrics.module.ts           — NestJSRxJSMetricsModule.create<C,G,H,S,HL,SL>()
  interface/
    metrics-module-options.interface.ts   — MetricsModuleOptionsInterface<C,G,H,S,HL,SL> extends PrometheusOptions
  nestjs-rxjs-metrics-service/
    nestjs-rxjs-metrics.service.ts        — NestJSRxJSMetricsService<C,G,H,S,HL,SL> (generic base class)
  type/
    metrics-config.type.ts                — MetricConfig = Record<string, string>
    labels-config.type.ts                 — LabelsConfig<M, E extends string = string> = Record<keyof M, readonly E[]>
    histogram-record.type.ts              — HistogramRecord<H> = Record<keyof H, ReturnType<Histogram['startTimer']>[]>
    summary-record.type.ts                — SummaryRecord<S> = Record<keyof S, ReturnType<Summary['startTimer']>[]>
  util/
    create-metrics-record.util.ts         — createMetricsRecord(type, enumObj, labelNames?) via getOrCreateMetric
    rxjs-operator.util.ts                 — rxjsOperator(handlerFn) shared concatMap pass-through
```

### Key Patterns

- `NestJSRxJSMetricsModule.create<C,G,H,S,HL,SL>(options)` destructures `options` into the four `*Metrics` /
  `*Labels` config objects plus the remaining `nestjsPrometheusOptions`, declares an inline `class MetricsService
  extends NestJSRxJSMetricsService<...>` whose constructor calls `createMetricsRecord('Counter'|'Gauge'|'Histogram'|
  'Summary', ...)` for each kind, imports `PrometheusModule.register(nestjsPrometheusOptions)`, and returns
  `[DynamicModule, Type<NestJSRxJSMetricsService<C,G,H,S,HL,SL>>]`
- `MetricConfig = Record<string, string>` — keys are metric names, values are the Prometheus `help` text
- `createMetricsRecord` calls `getOrCreateMetric` from `@willsoto/nestjs-prometheus` per metric key, passing
  `labelNames: Object.keys(labelNames[metric])` only when a `LabelsConfig` was supplied for that metric kind
  (histogram/summary only — counters and gauges never receive label names this way)
- `histogramStart`/`summaryStart` push the `startTimer(labels)` end-function onto a per-metric array
  (`startedHistogramMetrics[metric]` / `startedSummaryMetrics[metric]`) acting as a **LIFO stack**;
  `histogramEnd`/`summaryEnd` `pop()` the most recently pushed end-function and invoke it with the end-time labels —
  nested `start`/`end` pairs on the same metric+label combination unwind innermost-first
- If `end*` is called with nothing left to pop (`isDefined(metricEndFn)` is false), the timer end is silently
  skipped and `Logger.error('Cannot end histogram/summary for metric "<metric>" - It was not started', ...)` is
  logged instead of throwing — a mismatched start/end never crashes the stream
- All operator methods (`counter`, `gauge`, `gaugeInc`, `gaugeDec`, `histogramStart`, `histogramEnd`, `summaryStart`,
  `summaryEnd`) are built on the shared `rxjsOperator(handlerFn)` utility: `concatMap` pass-through that runs
  `handlerFn()` for its side effect and re-emits the untouched input
- `gaugeInc`/`gaugeDec` are thin wrappers over `gauge(metric, g => g.inc(value))` / `g.dec(value)`

### Dependencies

Peers: `@nestjs/common`, `@willsoto/nestjs-prometheus`, `prom-client`, `rxjs` (all four declared in both
`devDependencies` and `peerDependencies`). Direct dependency: `@rnw-community/shared` (`isDefined`, used in
production `src` for the missing-start-timer check).

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — no package-level
`coverageThreshold` override in `jest.config.js`.
