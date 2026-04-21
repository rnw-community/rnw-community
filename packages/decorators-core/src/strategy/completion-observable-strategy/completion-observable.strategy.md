# `completionObservableStrategy`

Emits `onSuccess` exactly **once per terminal event** on an Observable:

- **`complete`** → `onSuccess(lastEmittedValue)`.
- **`error`** → `onError(error)`.
- **`unsubscribe` before completion** → neither hook fires.
- **Never subscribed** → neither hook fires.

This mirrors OpenTelemetry's "only emit on completion" rule for durations and histograms: a cancelled operation is not a completion, so observing its partial duration would pollute dashboards (cancel latency is not the same as request latency).

If you want per-emission hooks (e.g., log every value), use [`observableStrategy`](../observable-strategy/observable.strategy.ts) instead; its `onSuccess` fires once per `next`.

The duration passed to the decorator's interceptor (`durationMs`) measures from subscription to completion — consumption time, not production time. Upstream backpressure (slow consumers) inflates this measurement.
