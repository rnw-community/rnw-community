# @rnw-community/nestjs-enterprise

Thin-adapter layer exposing NestJS-flavored decorators (`Log`, `HistogramMetric`, `SequentialLock`/`ExclusiveLock`, `SequentialLock$`/`ExclusiveLock$`) built on top of the universal decorator suite: `@rnw-community/decorators-core`, `@rnw-community/log-decorator`, and `@rnw-community/lock-decorator`.

## Package Commands

```bash
yarn test               # Run tests
yarn test:coverage      # Tests with coverage
yarn build              # Build (dual ESM + CJS)
yarn ts                 # Type check
yarn lint:fix           # Fix lint issues
```

## Architecture

### Directory Layout

```
src/
  pre-decorator-function.type.ts  — PreDecoratorFunction type
  decorator/
    log/                — Log decorator (thin adapter over @rnw-community/log-decorator)
    histogram-metric/   — HistogramMetric decorator (thin adapter over @rnw-community/histogram-metric-decorator + prom-client transport)
    lock/
      lock-service-store.adapter.ts  — LockServiceStoreAdapter: bridges LockServiceInterface ↔ LockStoreInterface
      lockable.service.ts            — DEPRECATED: LockableService base class
      interface/        — LockServiceInterface, LockHandle
      create-promise-lock-decorators/    — Modern DI-based promise lock factory (@rnw-community/lock-decorator)
      create-observable-lock-decorators/ — Modern DI-based observable lock factory
      lock-promise/     — DEPRECATED: inheritance-based promise lock
      lock-observable/  — DEPRECATED: inheritance-based observable lock
      util/             — Legacy lock utilities (used only by deprecated decorators)
```

### Subpath Exports

PascalCase convention: `./HistogramMetric`, `./Log`, `./LockPromise`, `./LockObservable`, `./CreatePromiseLockDecorators`, `./CreateObservableLockDecorators`

### Thin-adapter architecture

All three live decorator families delegate to the universal decorator suite:

- **Log**: `createLog` from `@rnw-community/log-decorator` + a NestJS `Logger` transport; Observable support via `observableStrategy` from `@rnw-community/decorators-core`; a call-shape bridge converts upstream's spread-style `(...args) => string` pre/post/error functions to the new array-style signature
- **HistogramMetric**: `createHistogramMetric` from `@rnw-community/histogram-metric-decorator` + a prom-client `Histogram` transport that converts the engine's milliseconds into prom-client's canonical seconds via `histogram.observe(durationMs / 1000)`. Sync and Promise paths emit one observation on completion or rejection; Observables are not specially handled (see the histogram package readme)
- **Locks**: `createPromiseLockDecorators` / `createObservableLockDecorators` in-package, each driving a NestJS DI binding through a `LockServiceStoreAdapter` that bridges the multi-resource `LockServiceInterface` to the single-key `LockStoreInterface` from `@rnw-community/lock-decorator` (multi-key resources are NUL-joined into one store key). Setup errors (missing DI, empty key) bypass `catchErrorFn`. `LockBusyError` is translated to the legacy `undefined`/`EMPTY` + `Error("Lock not acquired for keys: …")` shapes

### Key patterns preserved from upstream

- **DI-based lock factories** (modern): `createPromiseLockDecorators(LockService, duration)` returns `{ SequentialLock, ExclusiveLock }`
- Each factory call creates a unique `Symbol('LockService')` for DI isolation — multiple factories can coexist on the same class
- `@Inject(serviceToken)(target, symbol)` wires NestJS DI at decoration time
- Lock release errors silently swallowed
- `preLock` can be static `string[]` or a function `(...args) => string[]`
- Methods that return a non-Promise/non-Observable throw a descriptive error with the class-qualified method name
- `ExclusiveLock` (promise form) resolves to `undefined` on contention when no `catchErrorFn` is supplied — see `create-promise-lock-decorators.md`
- Observable error logging: `{ err: Error }` wrapping only when the error IS an Error instance; non-Error throws use the 2-arg form — applies uniformly across sync/Promise/Observable paths

### Dependencies

- `@rnw-community/shared` — `isDefined`, `isPromise`, `isNotEmptyArray`
- `@rnw-community/decorators-core` — interceptor engine + `observableStrategy`
- `@rnw-community/log-decorator` — `createLog` engine behind `Log`
- `@rnw-community/histogram-metric-decorator` — `createHistogramMetric` engine behind `HistogramMetric`
- `@rnw-community/lock-decorator` — `LockBusyError`, `LockStoreInterface`
- **Required peers**: `@nestjs/common`, `rxjs`
- **Optional peers** (`peerDependenciesMeta`): `ioredis`, `redlock`, `prom-client` (feature-specific)

### Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.

### Important Notes

- The deprecated `LockPromise`/`LockObservable`/`LockableService` require class inheritance — prefer the `create*LockDecorators` factories
- `redlock` has a Yarn patch applied (adds `"types"` to its exports for `moduleResolution: "bundler"`)
