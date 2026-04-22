# Histogram Metric Decorator

Framework-agnostic method decorator that records call duration into any histogram transport (Prometheus, OpenTelemetry, in-memory, …). Built on [`@rnw-community/decorators-core`](../decorators-core). TypeScript `experimentalDecorators`.

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

One decorator, correct duration semantics for all four shapes. Observable handling uses `completionObservableStrategy` from `@rnw-community/decorators-core` — wired by default. `rxjs` is an optional peer; install it when your methods return `Observable`.

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

`labels` receives the method's args as a tuple — inferred from the method signature, no annotations needed. Both destructuring (`labels: ([id]) => ({ orderId: id })`) and indexed access (`labels: (args) => ({ orderId: args[0] })`) work; pick whichever reads clearer for the call site. Default metric name is `<ClassName>_<methodName>_duration_ms`.

Wire any backend by implementing `HistogramTransportInterface`; Prometheus and OpenTelemetry adapters are typically a few lines each. The package is transport-agnostic — consumers ship their own.

## Public API

- [`createHistogramMetricDecorator`](src/factory/create-histogram-metric-decorator/create-histogram-metric-decorator.ts) — factory; returns `<K extends AnyFn>(...) => MethodDecoratorType<K>`
- [`HistogramTransportInterface`](src/interface/histogram-transport.interface.ts) — implement for any backend
- [`HistogramOptionsInterface`](src/interface/histogram-options.interface.ts) — per-decoration `{ name?, labels? }`
- [`CreateHistogramMetricOptionsInterface`](src/interface/create-histogram-metric-options.interface.ts) — `{ transport }`

## License

[MIT](../../LICENSE.md)
