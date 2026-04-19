# @rnw-community/decorators-core

Framework-agnostic interceptor primitive for building method decorators. Ships `createInterceptor` — a factory for `experimentalDecorators` method decorators — plus two built-in result strategies: `promiseStrategy` and `observableStrategy`.

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
    execution-context.interface.ts
    interceptor.interface.ts
    result-strategy.interface.ts
    create-interceptor-options.interface.ts
  type/
    method-decorator.type.ts
  strategy/
    promise-strategy/       — promiseStrategy + spec
    observable-strategy/    — observableStrategy + spec (RxJS; optional peer)
  engine/
    build-context/          — buildContext + spec
    run-interception/       — runInterception + spec
    create-interceptor/     — createInterceptor + spec
  index.ts
```

## Key Patterns

- One entity per file; folders only to group `source + spec` (+ optional `.md`)
- `onSuccess` receives `Awaited<TResult>` (the resolved value, not the raw Promise)
- Per-invocation `ExecutionContext` identity is stable across `onEnter`/`onSuccess`/`onError` — consumers depend on this
- Hook errors are swallowed inside the engine — transport failures never poison the decorated method
- Strategies are passed as an immutable factory option (no global mutation registry)
- Promise handling is built-in via `@rnw-community/shared`'s `isPromise`; Observable support requires opting into `observableStrategy`

## Dependencies

- `@rnw-community/shared` — `isPromise`, `isDefined`
- **Optional peer**: `rxjs` (only needed when importing `observableStrategy`)

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
