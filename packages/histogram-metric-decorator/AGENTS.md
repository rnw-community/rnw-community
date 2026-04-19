# @rnw-community/histogram-metric-decorator

Framework-agnostic method decorator for recording call durations into any histogram transport. Built on `@rnw-community/decorators-core`.

## Package Commands

```bash
yarn test               # Run tests
yarn test:coverage      # Tests with coverage
yarn build              # Build (dual ESM + CJS)
yarn ts                 # Type check
yarn lint:fix           # Fix lint issues
```

## Architecture

```
src/
  interface/
    create-histogram-metric-options-interface/
    histogram-options-interface/
    histogram-transport-interface/
  factory/
    create-histogram-metric/      — stage-3 factory + spec
    create-legacy-histogram-metric/ — legacy factory + spec
  transport/
    in-memory-histogram-transport/ — test-ready transport + spec
  index.ts
```

## Key Patterns

- One entity per folder (`<entity-name>/<entity-name>.<suffix>.ts` + colocated `.spec.ts`)
- Observation emitted on BOTH success and error paths (via `onSuccess` + `onError` engine hooks)
- Metric name defaults to `<ClassName>_<methodName>_duration_ms` when omitted; consumer can override
- Awaits Promises natively (via decorators-core engine); Observable support opt-in via `observableStrategy` from `@rnw-community/decorators-core/rxjs`

## Dependencies

- `@rnw-community/decorators-core` — interceptor engine + optional `/rxjs` strategy
- `@rnw-community/shared` — type guards

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
