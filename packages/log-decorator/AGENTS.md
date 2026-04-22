# @rnw-community/log-decorator

Framework-agnostic `@Log` method decorator with pluggable transport and structured pre/post/error hooks. Built on `@rnw-community/decorators-core`. Targets TypeScript's `experimentalDecorators` mode.

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
    log-transport.interface.ts
    create-log-options.interface.ts
  type/
    pre-log-input.type.ts
    post-log-input.type.ts
    error-log-input.type.ts
    get-result.type.ts        — unwraps Promise<U> / Observable<U> → U; re-exported because TS2742 forces it into the inferred public type of bound factories
  console-transport/      — default consoleTransport + spec
  create-log-decorator/   — decorator factory + spec
  util/
    create-log-interceptor.ts  — internal (wraps createInterceptor from decorators-core)
  index.ts
```

## Key Patterns

- One entity per file; folders only to group `source + spec` (+ optional `.md`)
- Observable support: pass `observableStrategy` from `@rnw-community/decorators-core` via the `strategies` factory option

## Dependencies

- `@rnw-community/decorators-core` — interceptor engine
- `@rnw-community/shared` — `isDefined`

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
