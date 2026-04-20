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

Observable-returning methods are NOT specially handled — an `Observable<T>` is a completion-oriented value, and a single `histogram.observe` on construction is almost never what you want. Measure completion latency with `tap()`/`finalize()` inside your stream explicitly.

## Usage

```bash
yarn add @rnw-community/histogram-metric-decorator @rnw-community/decorators-core
```

```ts
import { createHistogramMetric, inMemoryHistogramTransport } from '@rnw-community/histogram-metric-decorator';

const HistogramMetric = createHistogramMetric({ transport: inMemoryHistogramTransport() });

class OrderService {
    @HistogramMetric()
    async placeOrder(order: Order): Promise<Receipt> { /* ... */ }

    @HistogramMetric({ name: 'order_fetch_ms', labels: ([id]) => ({ orderId: id }) })
    async fetchOrder(id: string): Promise<Order> { /* ... */ }
}
```

`labels` receives the method's args as a tuple — inferred from the method signature, no annotations needed. Default metric name is `<ClassName>_<methodName>_duration_ms`.

## Public API

- [`createHistogramMetric`](src/factory/create-histogram-metric/create-histogram-metric.ts) — factory; returns `<K extends AnyFn>(...) => MethodDecoratorType<K>`
- [`inMemoryHistogramTransport`](src/transport/in-memory-histogram-transport.ts) — test-ready transport with `snapshot()`
- [`HistogramTransportInterface`](src/interface/histogram-transport.interface.ts) — implement for any backend
- [`HistogramOptionsInterface`](src/interface/histogram-options.interface.ts) — per-decoration `{ name?, labels? }`
- [`CreateHistogramMetricOptionsInterface`](src/interface/create-histogram-metric-options.interface.ts) — `{ transport }`

## License

[MIT](../../LICENSE.md)
