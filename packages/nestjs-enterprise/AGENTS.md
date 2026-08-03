# @rnw-community/nestjs-enterprise

Thin-adapter layer exposing NestJS-flavored decorators (`Log`, `HistogramMetric`, `SequentialLock`/`ExclusiveLock` via DI, plus deprecated inheritance-based `LockPromise`/`LockObservable`) on top of the universal decorator suite: `@rnw-community/log-decorator`, `@rnw-community/histogram-metric-decorator`, and `@rnw-community/lock-decorator`.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  type/
    pre-decorator-function.type.ts   — PreDecoratorFunction<TArgs, TResult = string> = (...args: TArgs) => TResult
  decorator/
    log/                 — Log decorator (thin adapter over @rnw-community/log-decorator) + spec + .md
    histogram-metric/
      histogram-metric.decorator.ts        — HistogramMetric(metricName, configuration?) + spec + .md
      histogram-metric-tracking.ts         — per-Registry WeakMap tracking of registered buckets/labelNames
    lock/
      create-lock-service-store.ts          — createLockServiceStore: bridges LockServiceInterface → LockStoreInterface (NUL-joins multi-resource keys)
      lockable.service.ts                   — DEPRECATED: LockableService base class (wraps a Redlock instance)
      lock-service-not-injected-message.const.ts — LOCK_SERVICE_NOT_INJECTED_MESSAGE
      resolve-resources.ts                  — resolveResources: preLock (string[] | fn) → non-empty string[], or throws
      resource-separator.const.ts            — RESOURCE_SEPARATOR = '\x00'
      interface/                — LockServiceInterface (acquire/tryAcquire), LockHandle
      create-promise-lock-decorators/    — createPromiseLockDecorators(serviceToken, defaultDuration) + spec + .md
      create-observable-lock-decorators/ — createObservableLockDecorators(serviceToken, defaultDuration) + spec + .md
      lock-promise/      — DEPRECATED: LockPromise (inheritance-based) + spec + .md
      lock-observable/   — DEPRECATED: LockObservable (inheritance-based) + spec + .md
      util/              — get-method-name, get-redlock-service, run-pre-lock, validate-redlock, execute-lock-promise.util, execute-lock-observable.util — all used only by the two deprecated decorators
  index.ts
```

### Subpath Exports

PascalCase convention: `./HistogramMetric`, `./Log`, `./LockPromise`, `./LockObservable`, `./CreatePromiseLockDecorators`, `./CreateObservableLockDecorators`.

### Thin-adapter architecture

- **Log**: `createLogDecorator({ transport: nestLogTransport })` from `@rnw-community/log-decorator`, bound once to a transport built on `@nestjs/common`'s `Logger`. The exported `Log` is the direct factory return — no further wrapper. Sync/Promise/Observable handling is entirely `log-decorator`'s own internal responsibility now (there is no `observableStrategy` involved anywhere in this package; that concept no longer exists in `decorators-core`).
- **HistogramMetric**: called directly as `HistogramMetric(metricName, configuration?)` — not a two-step factory like `Log`. It resolves (or lazily creates) a prom-client `Histogram` for `metricName` immediately and returns `createHistogramMetricDecorator({ transport })({ name: metricName, labels })` inline. `histogramMetricTracking` memoizes each registered metric's `{ buckets, labelNames }` per `Registry` in a `WeakMap`; a second `@HistogramMetric` call reusing the same name with **different** `buckets`/`labelNames` on the same registry throws a descriptive mismatch error (`"<name>" already registered with different buckets/labelNames. Existing: ... Requested: ...`); a call with a **matching** config reuses the existing prom-client `Histogram` instance instead of re-instantiating it. The transport converts the engine's milliseconds into prom-client's canonical seconds via `histogram.observe(labelValues, durationMs / 1000)`.
- **Locks — the two live factory families do NOT wire the same way, and neither goes through `createInterceptor`:**
  - `createPromiseLockDecorators(serviceToken, defaultDuration)` hand-rolls its own `descriptor.value = async function (...)`, calling `store.acquire` / releasing in a `finally` directly — it reuses `createLockServiceStore` (the `LockServiceInterface` → `LockStoreInterface` bridge) but does **not** reuse `@rnw-community/lock-decorator`'s `createLockMiddleware`; the acquire/invoke/release cycle is reimplemented locally.
  - `createObservableLockDecorators(serviceToken, defaultDuration)` **does** reuse `createLockMiddleware$` from `@rnw-community/lock-decorator` directly, invoking it by hand inside a `defer(...)` with a manually built `ExecutionContextInterface`-shaped object (`{ className: '', methodName, args, logContext: methodName }`) — since it bypasses `createInterceptor`, it never gets a real `className` from `decorators-core`'s `buildContext`.
  - Both bridge the multi-resource `LockServiceInterface` to the single-key `LockStoreInterface` via `createLockServiceStore`, which NUL-joins (`RESOURCE_SEPARATOR = '\x00'`) multi-resource keys into one store key.
  - `createObservableLockDecorators` wraps method-thrown errors in a local `MethodThrownError` marker class so its single `catchError` can tell a method failure apart from a lock-acquire failure and apply the right recovery (`recoverFromMethodError` vs `recoverFromAcquireError`); the Promise version doesn't need a marker since it catches around `store.acquire` and around invoking/awaiting the method in two separate `try` blocks.
  - `LockBusyError` translation is shared in spirit between both: for `mode === 'exclusive'` with no `catchErrorFn`/`catchErrorFn$` supplied, contention resolves to `undefined` (Promise) / `EMPTY` (Observable); otherwise `LockBusyError` is normalized into a generic `Error("Lock not acquired for keys: …")` (splitting the joined key back on `RESOURCE_SEPARATOR`) before being thrown or handed to the recovery callback.
  - Setup errors (missing DI binding, empty `preLock` result) bypass `catchErrorFn`/`catchErrorFn$` entirely and always throw.

### Key patterns

- Each `create*LockDecorators(serviceToken, defaultDuration)` call mints its own `Symbol('LockService')` for DI isolation, so multiple factories can coexist on the same class without colliding.
- `@Inject(serviceToken)(target, symbol)` wires NestJS DI at decoration time (inside the decorator function itself, not in a constructor).
- `preLock` (or the deprecated decorators' `preLock`) can be a static `string[]` or a function `(...args) => string[]`; an empty resulting array always throws `'Lock key is not defined'`.
- A decorated method that returns neither a `Promise` (promise family) nor an `Observable` (observable family) throws a descriptive error naming the class-qualified method (`` `${ClassName}::${methodName}` ``).
- Lock release errors are always silently swallowed on every path (deprecated and modern, Promise and Observable).
- The deprecated `LockPromise` / `LockObservable` / `LockableService` require class inheritance from `LockableService` (which wraps a `Redlock` instance); the modern `create*LockDecorators` factories use NestJS DI instead and are the documented replacement.

### Dependencies

- `@rnw-community/shared` — `isDefined`, `isPromise`, `isNotEmptyArray`, `isError`
- `@rnw-community/log-decorator` — `createLogDecorator` engine behind `Log`
- `@rnw-community/histogram-metric-decorator` — `createHistogramMetricDecorator` engine behind `HistogramMetric`
- `@rnw-community/lock-decorator` — `LockBusyError`, `createLockMiddleware$`, and the `LockStoreInterface`/`LockHandleInterface`/`LockModeType`/`AcquireOptionsInterface` types (`@rnw-community/decorators-core` is **not** a direct dependency of this package — it's only pulled in transitively through `log-decorator`/`histogram-metric-decorator`)
- **Required peer**: `@nestjs/common`
- **Optional peers** (`peerDependenciesMeta`): `ioredis`, `redlock`, `prom-client` — each needed only by the feature that uses it (`LockableService`/deprecated lock decorators for `ioredis`+`redlock`, `HistogramMetric` for `prom-client`); `rxjs` is a required peer (used by the Observable lock family and `Log`'s Observable branch)

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines).

### Important Notes

- `redlock` has a Yarn patch applied (adds `"types"` to its exports for `moduleResolution: "bundler"` consumers).
- Prefer `createPromiseLockDecorators` / `createObservableLockDecorators` over the deprecated inheritance-based `LockPromise` / `LockObservable`.
