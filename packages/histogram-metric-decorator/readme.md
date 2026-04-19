# Histogram Metric Decorator

Framework-agnostic method decorator for recording call durations into any histogram transport — Prometheus, OpenTelemetry, in-memory, whatever you wire up.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Fhistogram-metric-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fhistogram-metric-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Fhistogram-metric-decorator)

Built on [@rnw-community/decorators-core](../decorators-core). Ships both TC39 stage-3 and legacy (`experimentalDecorators`) factories. Awaits Promises so async methods report accurate end-to-end durations. Observable support is opt-in via `@rnw-community/decorators-core/rxjs`.

## Installation

```bash
yarn add @rnw-community/histogram-metric-decorator @rnw-community/decorators-core
```

## Usage — stage-3

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

## Usage — legacy (`experimentalDecorators`)

```ts
import { createLegacyHistogramMetric } from '@rnw-community/histogram-metric-decorator';

const HistogramMetric = createLegacyHistogramMetric({ transport: myTransport });
```

## Usage — with RxJS Observables

```ts
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';
import { createHistogramMetric } from '@rnw-community/histogram-metric-decorator';

const HistogramMetric = createHistogramMetric({
    transport: myTransport,
    strategies: [observableStrategy],
});
```

## Public API

- [`createHistogramMetric`](src/factory/create-histogram-metric/create-histogram-metric.ts) — stage-3 decorator factory
- [`createLegacyHistogramMetric`](src/factory/create-legacy-histogram-metric/create-legacy-histogram-metric.ts) — legacy decorator factory
- [`inMemoryHistogramTransport`](src/transport/in-memory-histogram-transport/in-memory-histogram-transport.ts) — test-ready transport with `snapshot()`
- [`HistogramTransportInterface`](src/interface/histogram-transport-interface/histogram-transport.interface.ts) — transport contract
- [`HistogramOptionsInterface`](src/interface/histogram-options-interface/histogram-options.interface.ts) — per-decoration options (`name`, `labels`)
- [`CreateHistogramMetricOptionsInterface`](src/interface/create-histogram-metric-options-interface/create-histogram-metric-options.interface.ts) — factory options

## License

MIT — see [LICENSE](../../LICENSE.md).
