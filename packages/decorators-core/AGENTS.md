# @rnw-community/decorators-core

Framework-agnostic interceptor primitive for building method decorators. Ships both TC39 stage-3 (`createInterceptor`) and legacy `experimentalDecorators` (`createLegacyInterceptor`) factories sharing one engine. RxJS Observable support is opt-in via the `./rxjs` subpath export.

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
  type/
    any-method-type/
    execution-context-interface/
    interceptor-interface/
    result-strategy-interface/
  util/
    now/
  engine/
    build-context/
    run-interception/
    create-interceptor/
    create-legacy-interceptor/
  strategy/
    promise-strategy/
  rxjs/
    observable-strategy/
    index.ts                      — subpath entry: `@rnw-community/decorators-core/rxjs`
  index.ts
```

## Key Patterns

- One entity per folder (`<entity-name>/<entity-name>.<suffix>.ts` + colocated `.spec.ts`)
- `onSuccess` receives `Awaited<TResult>` (the resolved value, not the raw Promise)
- Per-invocation `ExecutionContext` identity is stable across `onEnter`/`onSuccess`/`onError` — consumers (e.g., histogram WeakMap bridges) depend on this
- Hook errors are swallowed inside the engine — transport failures never poison the decorated method
- Strategies are passed as an immutable factory option (no global mutation registry)
- Promise handling is built-in via `@rnw-community/shared`'s `isPromise`; Observable support requires passing `observableStrategy` from the `./rxjs` subpath

## Subpath exports

- `.` — main entry (zero runtime deps beyond `@rnw-community/shared`)
- `./rxjs` — `observableStrategy` for RxJS users; `rxjs` is an optional peer dep

## Dependencies

- `@rnw-community/shared` — `isPromise`, `isDefined`
- **Optional peer**: `rxjs` (only needed when importing from `./rxjs`)

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
