# `@HistogramMetric` decorator

Method decorator that records call duration into a [`prom-client`](https://github.com/siimon/prom-client) `Histogram`. One decorator, correct duration semantics for every return shape.

## When the observation fires

| Return | When |
|---|---|
| `T` (sync) | on return |
| `Promise<T>` | on resolve |
| `Promise<T>` that rejects | on reject (duration still emitted; error propagates) |
| `Observable<T>` | on stream `complete` |
| `Observable<T>` that errors | on stream error (duration still emitted; error propagates) |

Observable support uses `completionObservableStrategy` from [`@rnw-community/decorators-core`](../../../../../decorators-core); wired by default. `rxjs` is required when methods return `Observable`.

## Installation

Only `prom-client` is required. Nothing else:

```bash
yarn add prom-client
```

No `nestjs-prometheus` or other wrapper — `@HistogramMetric` uses `prom-client` directly and resolves histograms via the global registry (or a custom `configuration.registers`).

## Usage

```typescript
import { HistogramMetric } from '@rnw-community/nestjs-enterprise';

class CatsService {
    @HistogramMetric('cats_find_all_duration', { buckets: [0.01, 0.1, 0.5, 1, 5] })
    async findAll(): Promise<Cat[]> { /* ... */ }
}
```

First argument is the metric name; second is an optional `Omit<HistogramConfiguration, 'name'>` — same shape `prom-client` accepts on `new Histogram(...)`. Buckets are seconds (`prom-client`'s convention); the adapter converts the engine's milliseconds internally via `durationMs / 1000`.

## Custom registry

Pass `registers: [myRegistry]` to route observations to a registry other than the global default. The adapter looks up existing histograms in the first supplied registry before creating a new one — multiple decorations of the same metric name share the same `Histogram` instance.

## Labels

Pass `labels: (args) => ({...})` on the `configuration` object to attach per-call label values. The callback receives the decorated method's argument tuple; the return becomes prom-client's `LabelValues` for the observation.

```typescript
@HistogramMetric<'tenant' | 'operation'>('cats_find_all_duration', {
    labelNames: ['tenant', 'operation'],
    labels: ([tenantId, op]: [string, string]) => ({ tenant: tenantId, operation: op }),
})
async findAll(tenantId: string, op: string): Promise<Cat[]> { /* ... */ }
```

Label names must be declared in prom-client's `labelNames` field for the histogram, otherwise the observation is rejected at runtime.
