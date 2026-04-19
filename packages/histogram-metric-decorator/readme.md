# Histogram Metric Decorator

Framework-agnostic method decorator for recording call durations into any histogram transport — Prometheus, OpenTelemetry, in-memory, whatever you wire up.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Fhistogram-metric-decorator)

Built on [@rnw-community/decorators-core](../decorators-core). Targets TypeScript's `experimentalDecorators` mode. Measures sync method duration on return and Promise method duration on settlement.

## Supported return shapes

| Return | When the observation fires |
|---|---|
| `T` (sync) | when the method returns |
| `Promise<T>` | when the Promise resolves |
| `Promise<T>` that rejects | when the Promise rejects (duration is still emitted; the error propagates) |

**Observable-returning methods are not specially handled.** Observables are completion-oriented by nature and a histogram wants completion-latency, not per-emission latency. If you need completion-latency for an RxJS pipeline today, measure it explicitly with `tap(() => ...)` / `finalize(...)` inside your stream. A dedicated completion-aware strategy may ship in a future release if a real consumer needs it.

## Installation

```bash
yarn add @rnw-community/histogram-metric-decorator @rnw-community/decorators-core
```

## Usage

```ts
import { createLegacyHistogramMetric, inMemoryHistogramTransport } from '@rnw-community/histogram-metric-decorator';

const HistogramMetric = createLegacyHistogramMetric({ transport: inMemoryHistogramTransport() });

class OrderService {
    @HistogramMetric()
    async placeOrder(order: Order): Promise<Receipt> { /* ... */ }

    @HistogramMetric({ name: 'order_fetch_ms', labels: ([id]) => ({ orderId: id }) })
    async fetchOrder(id: string): Promise<Order> { /* ... */ }
}
```

## Public API

- [`createLegacyHistogramMetric`](src/factory/create-legacy-histogram-metric/create-legacy-histogram-metric.ts) — decorator factory
- [`inMemoryHistogramTransport`](src/transport/in-memory-histogram-transport.ts) — test-ready transport with `snapshot()`
- [`HistogramTransportInterface`](src/interface/histogram-transport.interface.ts) — transport contract
- [`HistogramOptionsInterface`](src/interface/histogram-options.interface.ts) — per-decoration options (`name`, `labels`)
- [`CreateHistogramMetricOptionsInterface`](src/interface/create-histogram-metric-options.interface.ts) — factory options

## License

MIT — see [LICENSE](../../LICENSE.md).
