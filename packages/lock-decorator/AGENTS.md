# @rnw-community/lock-decorator

Framework-agnostic sequential and exclusive method lock decorators — Promise-returning and Observable-returning variants — with pluggable store, timeout + `AbortSignal` support, and typed errors. Targets TypeScript's `experimentalDecorators` mode. The package ships only the factories + the `LockStoreInterface` contract; consumers wire their own store (Redis/Redlock/in-memory/etc.) — no store implementation, mock, or `*.mock.ts` file ships in `src/`.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  error/
    lock-acquire-timeout-error/  — LockAcquireTimeoutError(key, timeoutMs, { cause? }) + spec
    lock-busy-error/             — LockBusyError(key, { cause? }) + spec
  factory/
    create-exclusive-lock-decorator/             — createExclusiveLockDecorator(options) + spec
    create-exclusive-lock-decorator-observable/   — createExclusiveLockDecorator$(options) (no dedicated spec)
    create-sequential-lock-decorator/             — createSequentialLockDecorator(options) + spec
    create-sequential-lock-decorator-observable/  — createSequentialLockDecorator$(options) (no dedicated spec)
  interface/
    acquire-options.interface.ts     — AcquireOptionsInterface: { timeoutMs?, signal? }
    create-lock-options.interface.ts — CreateLockOptionsInterface: { store }
    lock-handle.interface.ts         — LockHandleInterface: { key, mode, release() }
    lock-store.interface.ts          — LockStoreInterface: acquire(key, mode, options?)
  type/
    exclusive-lock-argument.type.ts    — string | (args) => string | { key: string | (args) => string }
    lock-argument.type.ts              — SequentialLockArgumentType<TArgs> | ExclusiveLockArgumentType<TArgs>
    lock-mode.type.ts                  — 'sequential' | 'exclusive'
    sequential-lock-argument.type.ts   — adds optional { timeoutMs?, signal? } to the object form
  util/
    assert-valid-timeout-ms/           — assertValidTimeoutMs(value) + spec
    create-lock-middleware/            — createLockMiddleware(store, mode, arg): Promise-returning InterceptorMiddleware (no dedicated spec — exercised via the factory specs)
    create-lock-middleware-observable/ — createLockMiddleware$(store, mode, arg): Observable-returning InterceptorMiddleware (no dedicated spec)
    resolve-lock-key/                  — resolveLockKey(arg, args) + spec
  index.ts
```

### Key Patterns

- **No shipped store.** There is no `store/` directory and no `create-in-memory-lock-store.mock.ts` anywhere in this package (this differs from an earlier version of the package, which shipped one). Both `create-*-lock-decorator.spec.ts` files build their own throwaway FIFO/exclusive-set in-memory `LockStoreInterface` fixture inline — duplicated across the two spec files rather than shared, per the monorepo's "test-only code lives in the spec" rule.
- **The Promise factories do not runtime-check the return shape.** `createLockMiddleware` does `return await Promise.resolve(next())` — a method whose actual runtime behavior returns a non-Promise value is simply wrapped in a resolved Promise, not rejected. The compile-time constraint (`K extends (...args) => Promise<unknown>`) is TypeScript-only; there is no runtime guard here, unlike `@rnw-community/nestjs-enterprise`'s `createPromiseLockDecorators`, which explicitly throws when `originalMethod` doesn't return a thenable.
- `resolveLockKey` is the single resolver for **both** argument shapes (`SequentialLockArgumentType` and `ExclusiveLockArgumentType`): a plain string, a `(args) => string` function, or an object with `key` (string or function) and, for the sequential shape only, optional `timeoutMs`/`signal`. The waiting semantics themselves (actually delaying on `timeoutMs`, honoring `signal`) live entirely in the consumer's `LockStoreInterface` implementation — this package only resolves the key + options and calls `store.acquire`.
- `LockBusyError` / `LockAcquireTimeoutError` are types this package **defines** for a consumer's store to throw; the package itself never throws either — both spec files' in-memory store fixtures are the ones raising them.
- `assertValidTimeoutMs` (used inside `resolveLockKey`) throws `TypeError` for a `timeoutMs` that isn't a positive finite number; `undefined` is always accepted (no timeout).
- Release is always best-effort: `createLockMiddleware` swallows a rejected `handle.release()` via `.catch(emptyFn)` inside a `finally`, and `createLockMiddleware$` does the same inside `finalize()` — a broken release must never surface to the caller or mask the method's own result/error.
- The Observable factories (`createSequentialLockDecorator$` / `createExclusiveLockDecorator$`, built on `createLockMiddleware$`) acquire the lock by bridging the store's Promise-based `acquire` into a single-emission `Observable` via a manual `new Observable(...)` constructor (`acquireHandle$`), wired to an internal `AbortController` that also listens to the caller's own `options.signal`. Once acquired, the decorated method's Observable is subscribed through `concatMap`, and release always runs inside `finalize()` regardless of complete / error / unsubscribe. Unsubscribing before acquisition resolves aborts the pending acquire rather than releasing a handle that was never granted.
- **Coverage gap, verified by grep:** no `.spec.ts` in this package references anything "observable" — `create-lock-middleware-observable.ts` and both `-observable` factories have zero direct test coverage from this package's own suite. Since Jest only instruments files a test run actually imports, these three files simply don't appear in (or count against) this package's coverage report. Their behavior is exercised only where a downstream consumer imports them directly (`@rnw-community/nestjs-enterprise`'s `createObservableLockDecorators` imports `createLockMiddleware$`).

### Dependencies

- `@rnw-community/decorators-core` — `InterceptorMiddleware` (type only)
- `@rnw-community/shared` — `isDefined`, `isEmptyString`, `isString`, `emptyFn`
- **Optional peer**: `rxjs` — needed only for `createLockMiddleware$` / `createSequentialLockDecorator$` / `createExclusiveLockDecorator$`
- **Optional peer**: `typescript` (`>=5.2.0`)

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — see the coverage-gap note above for the three files this package's own suite never imports.
