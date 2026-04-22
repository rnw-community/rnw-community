# Histogram Metric Decorator

Framework-agnostic method decorator that records call duration into any histogram transport (Prometheus, OpenTelemetry, in-memory, …). Built on [`@rnw-community/decorators-core`](../decorators-core). Handles sync, `Promise`, and `Observable` return types with a single decorator. TypeScript `experimentalDecorators`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Fhistogram-metric-decorator)

## When the observation fires

| Return | When |
|---|---|
| `T` (sync) | on return |
| `Promise<T>` | on resolve |
| `Promise<T>` that rejects | on reject (duration still emitted; error propagates) |
| `Observable<T>` | on `complete` (completion-latency) |
| `Observable<T>` that errors | on stream error (duration still emitted; error propagates) |

One decorator, correct duration semantics for all five shapes. Observable support is built in — `rxjs` is an optional peer, install it only when your methods return `Observable`.

## Usage

```bash
yarn add @rnw-community/histogram-metric-decorator @rnw-community/decorators-core
```

```ts
import { createHistogramMetricDecorator } from '@rnw-community/histogram-metric-decorator';

import type { HistogramTransportInterface } from '@rnw-community/histogram-metric-decorator';

declare const transport: HistogramTransportInterface;

const HistogramMetric = createHistogramMetricDecorator({ transport });

class OrderService {
    @HistogramMetric()
    async placeOrder(order: Order): Promise<Receipt> { /* ... */ }

    @HistogramMetric({ name: 'order_fetch_ms', labels: ([id]) => ({ orderId: id }) })
    async fetchOrder(id: string): Promise<Order> { /* ... */ }
}
```

`labels` receives the method's args as a tuple — inferred from the method signature, no annotations needed. Both destructuring (`labels: ([id]) => ({ orderId: id })`) and indexed access (`labels: (args) => ({ orderId: args[0] })`) work; pick whichever reads clearer at the call site. Default metric name is `` `${className}_${methodName}_duration_ms` ``.

Wire any backend by implementing `HistogramTransportInterface` (`observe(name, durationMs, labels?)`); Prometheus and OpenTelemetry adapters are typically a few lines each. The package is transport-agnostic — consumers ship their own.

## Crash-safe label resolution — `onLabelsError`

If the `labels` callback throws (for example because it dereferences a property on an optional argument that turned out to be `undefined`), the observation is still emitted — without labels — rather than crashing the decorated method. Pass `onLabelsError` to observe these throws for your diagnostics:

```ts
const HistogramMetric = createHistogramMetricDecorator({
    transport,
    onLabelsError: (err, args) => logger.warn({ err, args }, 'histogram label resolver threw'),
});
```

The `onLabelsError` hook itself is crash-safe — exceptions inside it are swallowed so a broken diagnostic never poisons the method it was observing.

## Public API

- [`createHistogramMetricDecorator`](src/factory/create-histogram-metric-decorator/create-histogram-metric-decorator.ts) — factory; takes `{ transport, onLabelsError? }` and returns `<K extends AnyFn>(config?) => MethodDecoratorType<K>`
- [`HistogramTransportInterface`](src/interface/histogram-transport.interface.ts) — `observe(name, durationMs, labels?)`; implement for any backend
- [`HistogramOptionsInterface<TArgs>`](src/interface/histogram-options.interface.ts) — per-decoration `{ name?, labels? }`
- [`CreateHistogramMetricOptionsInterface`](src/interface/create-histogram-metric-options.interface.ts) — `{ transport, onLabelsError? }`

## License

[MIT](../../LICENSE.md)
