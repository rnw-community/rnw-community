# @rnw-community/decorators-core

Framework-agnostic interceptor primitive for building method decorators. Ships `createInterceptor` — a factory for `experimentalDecorators` method decorators — plus four built-in result strategies: `syncStrategy`, `promiseStrategy`, `observableStrategy`, and `completionObservableStrategy`.

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
    get-result.type.ts        — GetResultType unwrap helper (Promise / Observable → inner)
  strategy/
    sync-strategy/            — syncStrategy + spec (catch-all, zero deps)
    promise-strategy/         — promiseStrategy + spec (zero deps)
    observable-strategy/      — observableStrategy + spec (per-emission; rxjs peer)
    completion-observable-strategy/ — completionObservableStrategy + spec (completion-latency; rxjs peer)
  engine/
    build-context/            — buildContext + spec
    run-interception/         — runInterception + spec
    create-interceptor/       — createInterceptor + spec
  index.ts
```

`MethodDecoratorType<K>` is owned by `@rnw-community/shared` — not re-exported from this package.

## Key Patterns

- One entity per file; folders only to group `source + spec` (+ optional `.md`)
- `onSuccess` receives `Awaited<TResult>` (the resolved value, not the raw Promise)
- Per-invocation `ExecutionContext` identity is stable across `onEnter`/`onSuccess`/`onError` — consumers depend on this
- Hook errors are swallowed inside the engine — transport failures never poison the decorated method
- Strategies are passed as an immutable factory option (no global mutation registry)
- **Engine is a strategy coordinator.** `createInterceptor` builds a dispatch chain `[...userStrategies, promiseStrategy, syncStrategy]`; the engine finds the first matching strategy and delegates. `syncStrategy.matches` returns `true` unconditionally (terminal catch-all)
- Promise and sync handling auto-wired via the built-in strategies; Observable support requires opting into `observableStrategy` or `completionObservableStrategy`
- `ResultStrategyInterface.handle` MUST NOT throw synchronously — exceptions propagate unguarded past `onError`

## Dependencies

- `@rnw-community/shared` — `isPromise`, `isDefined`, `EmptyFn`, `emptyFn`, `isNotEmptyString`, `MethodDecoratorType`
- **Optional peer**: `rxjs` (only needed when importing `observableStrategy` or `completionObservableStrategy`)

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
