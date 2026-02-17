# @rnw-community/nestjs-enterprise

Enterprise-grade NestJS method decorators: distributed locking (Promise + Observable), structured logging, and Prometheus histogram metrics.

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
  decorator/
    log/                — Log decorator (pre/post/error hooks via NestJS Logger)
    histogram-metric/   — HistogramMetric decorator (prom-client histogram timing)
    lock/
      interface/        — LockServiceInterface, LockHandle
      create-promise-lock-decorators/   — Modern DI-based promise lock factory
      create-observable-lock-decorators/ — Modern DI-based observable lock factory
      lock-promise/     — DEPRECATED: inheritance-based promise lock
      lock-observable/  — DEPRECATED: inheritance-based observable lock
      service/          — DEPRECATED: LockableService base class
      util/             — Lock utility functions (execute, inject, get-service, run-pre-lock)
  type/                 — PreDecoratorFunction type
```

### Subpath Exports

PascalCase convention: `./HistogramMetric`, `./Log`, `./LockPromise`, `./LockObservable`, `./CreatePromiseLockDecorators`, `./CreateObservableLockDecorators`

### Key Patterns

- **DI-based lock factories** (modern): `createPromiseLockDecorators(LockService, duration)` returns `{ SequentialLock, ExclusiveLock }`
- Each factory call creates a unique `Symbol('LockService')` for DI isolation — multiple factories can coexist on the same class
- `@Inject(serviceToken)(target, symbol)` wires NestJS DI at decoration time
- `retryCount: undefined` = sequential/blocking (waits), `retryCount: 0` = exclusive/non-blocking (skips if locked)
- Lock release errors are silently swallowed in `finally` to avoid polluting business logic
- `preLock` can be static `string[]` or a function `(...args) => string[]`

### Dependencies

- `@rnw-community/shared` — type guards, utility types
- **Required peers**: `@nestjs/common`, `rxjs`
- **Optional peers** (`peerDependenciesMeta`): `ioredis`, `redlock`, `prom-client` (feature-specific)

### Coverage

Custom thresholds: branches **92.1%**, statements **98%**, functions **94.1%**, lines **99.9%**.

### Important Notes

- The deprecated `LockPromise`/`LockObservable`/`LockableService` require class inheritance — prefer the `create*LockDecorators` factories
- `redlock` has a Yarn patch applied (adds `"types"` to its exports for `moduleResolution: "bundler"`)
