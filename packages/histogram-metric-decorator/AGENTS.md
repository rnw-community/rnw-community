# @rnw-community/histogram-metric-decorator

Framework-agnostic method decorator for recording call durations into any histogram transport. Built on `@rnw-community/decorators-core`. Targets TypeScript's `experimentalDecorators` mode.

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
    create-histogram-metric-options.interface.ts
    histogram-options.interface.ts
    histogram-transport.interface.ts
    in-memory-histogram-transport.interface.ts
    in-memory-observation.interface.ts
  factory/
    create-histogram-metric-decorator/      — decorator factory + spec
  transport/
    in-memory-histogram-transport.ts  — test-ready transport
    in-memory-histogram-transport.spec.ts
  index.ts
```

## Key Patterns

- One entity per file; folders only to group `source + spec` (+ optional `.md`)
- Observation emitted on BOTH success and error paths (via `onSuccess` + `onError` engine hooks)
- Metric name defaults to `<ClassName>_<methodName>_duration_ms` when omitted; consumer can override via `{ name }`
- Sync returns emit on return; Promise returns emit on settle (resolve or reject). Observable returns are NOT specially handled — observations fire once on the sync return of the Observable reference, not on stream completion

## Dependencies

- `@rnw-community/decorators-core` — interceptor engine

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
