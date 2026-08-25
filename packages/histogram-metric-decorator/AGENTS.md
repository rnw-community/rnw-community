# @rnw-community/histogram-metric-decorator

Transport-agnostic histogram/duration method decorator built on `@rnw-community/decorators-core`'s single-middleware interceptor. Targets TypeScript's `experimentalDecorators` mode. Zero opinion on the metrics backend — consumers wire their own `HistogramTransportInterface`.

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm lint:fix
```

## Architecture

```text
src/
  interface/
    create-histogram-metric-options.interface.ts — CreateHistogramMetricOptionsInterface: { transport, onLabelsError? }
    histogram-options.interface.ts                — HistogramOptionsInterface<TArgs>: { name?, labels? }
    histogram-transport.interface.ts               — HistogramTransportInterface: observe(name, durationMs, labels?)
  factory/
    create-histogram-metric-decorator/ — createHistogramMetricDecorator(options) factory + spec
  index.ts
```

There is no `transport/` directory and no `*.mock.ts` in-memory transport shipped in `src/`. The spec builds its own throwaway in-memory `HistogramTransportInterface` fixture inline (`createInMemoryTransport`), per the monorepo's rule that test-only fixtures live inside the spec that needs them.

### Key Patterns

- The single middleware (`buildHistogramMiddleware`) measures elapsed time with `performance.now()` at entry and calls `transport.observe(...)` on the terminal event, branching by hand on `next()`'s return shape with `isPromise` (from `@rnw-community/shared`) and `isObservable` (from `rxjs`) — the same one-middleware-covers-every-shape pattern as `log-decorator`; there is no `completionObservableStrategy` import from `decorators-core` (that strategy no longer exists).
- Default metric name is `` `${className}_${methodName}_duration_ms` ``, read off `ExecutionContextInterface`, unless `config.name` is supplied.
- Sync and Promise-returning methods emit exactly one observation, on return or on settle (resolve **or** reject) — duration is measured even when the method throws/rejects.
- Observable-returning methods emit exactly one observation on stream `complete` **or** `error` (via `tap({ complete })` + `catchError`), regardless of how many values were emitted in between — including a stream that completes without ever emitting.
- `labels` resolution is defensive: `resolveLabelsSafely` wraps the `labels(args)` call in try/catch. A thrown error means the observation is still recorded, just without labels, and the error is forwarded to the optional `onLabelsError(err, args)` hook — which is itself wrapped in try/catch so a broken hook can never block the observation or crash the decorated method.
- `labels` receives the method's argument tuple as a single array parameter (`(args: TArgs) => ({...})` — array form), the same convention `lock-decorator`'s key resolvers use, distinct from `log-decorator`'s spread form (`(...args) => ...`).

### Dependencies

- `@rnw-community/decorators-core` — `createInterceptor`, `InterceptorMiddleware`
- `@rnw-community/shared` — `isPromise`
- **Optional peer**: `rxjs` — only touched at runtime via `isObservable`
- **Optional peer**: `typescript` (`>=5.2.0`)

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines).
