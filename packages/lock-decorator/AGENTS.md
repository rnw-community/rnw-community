# @rnw-community/lock-decorator

Framework-agnostic `@SequentialLock` / `@ExclusiveLock` method decorators with pluggable store, FIFO in-memory default, timeout + AbortSignal support, and typed errors. Targets TypeScript's `experimentalDecorators` mode.

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
    lock-mode.type.ts
    lock-argument.type.ts                — union alias: SequentialLockArgumentType | ExclusiveLockArgumentType
    sequential-lock-argument.type.ts     — string | (args) => string | {key, timeoutMs?, signal?}
    exclusive-lock-argument.type.ts      — string | (args) => string | {key}  (no waiting, so no timeoutMs/signal)
  interface/
    acquire-options.interface.ts         — timeoutMs, signal
    lock-handle.interface.ts             — key, mode, release()
    lock-store.interface.ts              — acquire(key, mode, options)
    in-memory-lock-store.interface.ts    — adds sequentialChainCount / exclusiveHeldCount observers
    create-lock-options.interface.ts     — { store }
  error/
    lock-busy-error/                     — LockBusyError; thrown when exclusive key is held
    lock-acquire-timeout-error/          — LockAcquireTimeoutError; thrown when sequential timeoutMs expires
  store/
    create-in-memory-lock-store/         — single-process FIFO + exclusive set
  util/
    resolve-lock-key/                    — shared resolver for sequential/exclusive argument shapes
    run-with-lock/                       — acquire → run → release; rejects non-Promise results at runtime
    run-with-lock-rxjs/                  — runWithLock$; bridges AbortSignal, releases on complete/error/unsubscribe
  factory/
    create-sequential-lock-decorator/    — returns MethodDecoratorType<K> with K constrained to Promise-returning; runtime-rejects non-Promise methods
    create-exclusive-lock-decorator/     — returns MethodDecoratorType<K> with K constrained to Promise-returning; runtime-rejects non-Promise methods
  index.ts
```

## Key Patterns

- **Async-only at the type level** — both factories return `MethodDecoratorType<K>` where `K extends (...args) => Promise<unknown>`; applying them to a sync method is a compile-time error and, if bypassed with a cast, a runtime rejection (`Error('Locked method must return a Promise')`)
- **Exclusive locks don't wait** — argument type does NOT accept `timeoutMs` or `signal`; acquire either succeeds or throws `LockBusyError`
- **Sequential locks can wait** — accept `timeoutMs` (→ `LockAcquireTimeoutError`) and `signal: AbortSignal` (→ `DOMException('AbortError')`) threaded through the store
- **Release is idempotent** on both modes — a stale handle's second `release()` is a no-op
- **Terminal waiters clean up the tail** — on timeout/abort the reject branch schedules `deleteTailIfStillOurs` via `nextTail.then(...)`, so no stale chain entry survives when no later acquirer arrives
- **`runWithLock$` is leak-free** — a named `forward` listener is registered on the external `AbortSignal` and removed on teardown (complete, error, or unsubscribe)
- **Thenable support via `isPromise`** (from `@rnw-community/shared`) — catches non-native Promises and cross-realm promises so the lock is held until resolution

## Dependencies

- `@rnw-community/shared` — `isDefined`, `isPromise`
- **Optional peer**: `rxjs` (only needed for `runWithLock$`)

## Coverage

Default monorepo threshold: **99.9%** on all metrics. Currently **100%**.
