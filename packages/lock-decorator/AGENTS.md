# @rnw-community/lock-decorator

Framework-agnostic `@SequentialLock` / `@ExclusiveLock` method decorators with pluggable store, FIFO in-memory default, timeout + AbortSignal support, and typed errors.

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
    lock-mode-type/
    lock-argument-type/                — union alias: SequentialLockArgumentType | ExclusiveLockArgumentType
    sequential-lock-argument-type/     — string | (args) => string | {key, timeoutMs?, signal?}
    exclusive-lock-argument-type/      — string | (args) => string | {key}  (no waiting, so no timeoutMs/signal)
  interface/
    acquire-options-interface/         — timeoutMs, signal
    lock-handle-interface/             — key, mode, release()
    lock-store-interface/              — acquire(key, mode, options)
    create-lock-options-interface/
  error/
    lock-busy-error/                   — thrown when exclusive key is held
    lock-acquire-timeout-error/        — thrown when sequential timeoutMs expires
  store/
    create-in-memory-lock-store/       — single-process FIFO + exclusive set
  util/
    resolve-sequential-lock-key/
    resolve-exclusive-lock-key/
    run-with-lock/                     — acquire → run → release (isPromise from shared for thenable support)
  factory/
    create-sequential-lock/            — stage-3 factory
    create-exclusive-lock/             — stage-3 factory
    create-legacy-sequential-lock/
    create-legacy-exclusive-lock/
    multi-factory/                     — cross-factory integration spec
  index.ts
```

## Key Patterns

- **Exclusive locks don't wait** — argument type does NOT accept `timeoutMs` or `signal`; tryAcquire either succeeds or throws `LockBusyError`
- **Sequential locks can wait** — accept `timeoutMs` (→ `LockAcquireTimeoutError`) and `signal: AbortSignal` (→ `DOMException('AbortError')`) threaded through the store
- **Release is idempotent** on both modes — a stale handle's second `release()` is a no-op, preventing eviction of a fresh holder
- **Chain-delete is release-only** — timeout/abort handlers never delete the `sequentialChains[key]` entry (prevents a race where the next acquirer would bypass an active holder)
- **Thenable support via `isPromise`** (from `@rnw-community/shared`) — catches non-native Promises and cross-realm promises so the lock is held until resolution
- One entity per folder

## Dependencies

- `@rnw-community/decorators-core` — `LegacyMethodDecoratorType`
- `@rnw-community/shared` — `isDefined`, `isPromise`

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
