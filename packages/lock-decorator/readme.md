# lock-decorator

Framework-agnostic sequential and exclusive method lock decorators built on top of TypeScript's `experimentalDecorators` mode. Dual ESM+CJS build.

**Async-only contract.** All lock decorators in this package — `createSequentialLock` and `createExclusiveLock` — require the decorated method to return a `Promise`. A sync method wrapped by one of these decorators is rejected at compile time by the decorator's type constraint, and at runtime with `Error('Locked method must return a Promise')` if the type check is bypassed. If you need to run an `Observable` pipeline under a lock, use `runWithLock$`, also exported from this package.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flock-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flock-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flock-decorator.svg)](https://www.npmjs.com/package/%40rnw-community/lock-decorator)

## Factories

### [createSequentialLock](src/factory/create-sequential-lock/create-sequential-lock.ts)

Queues concurrent calls in FIFO order. Accepts [`SequentialLockArgumentType`](src/type/sequential-lock-argument.type.ts) — a string key, a key-fn, or an object with `key`, optional `timeoutMs` and optional `signal`.

```ts
import { createSequentialLock, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const store = createInMemoryLockStore();
const SequentialLock = createSequentialLock({ store });

class DataService {
    @SequentialLock('fetch-data')
    async fetchData(): Promise<void> { /* ... */ }
}
```

### [createExclusiveLock](src/factory/create-exclusive-lock/create-exclusive-lock.ts)

Rejects immediately with [`LockBusyError`](src/error/lock-busy-error/lock-busy.error.ts) if the key is already held. Accepts [`ExclusiveLockArgumentType`](src/type/exclusive-lock-argument.type.ts) — a string key, a key-fn, or an object with `key`.

```ts
import { createExclusiveLock, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const store = createInMemoryLockStore();
const ExclusiveLock = createExclusiveLock({ store });

class Cache {
    @ExclusiveLock('cache-write')
    async write(value: string): Promise<void> { /* ... */ }
}
```

## Store

### [createInMemoryLockStore](src/store/create-in-memory-lock-store/create-in-memory-lock-store.ts)

Built-in in-memory implementation of [`LockStoreInterface`](src/interface/lock-store.interface.ts). Sequential mode chains acquires in FIFO order; exclusive mode rejects immediately on contention.

```ts
import { createInMemoryLockStore } from '@rnw-community/lock-decorator';

const store = createInMemoryLockStore();
const handle = await store.acquire('my-key', 'sequential', { timeoutMs: 3000 });
handle.release();
```

## RxJS

### [runWithLock$](src/util/run-with-lock-rxjs/run-with-lock-rxjs.ts)

Observable helper that acquires the lock, subscribes to the inner `Observable` from `fn()`, and releases on completion, error, or unsubscription. Bridges an external `AbortSignal` into the acquire path and cleans up its listener on teardown.

```ts
import { runWithLock$, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const store = createInMemoryLockStore();
const result$ = runWithLock$(store, 'stream-key', 'sequential', { timeoutMs: 1000 }, () => source$);
```

## Errors

- [`LockBusyError`](src/error/lock-busy-error/lock-busy.error.ts) — thrown by exclusive acquire when the key is already held.
- [`LockAcquireTimeoutError`](src/error/lock-acquire-timeout-error/lock-acquire-timeout.error.ts) — thrown by sequential acquire when `timeoutMs` expires.

## Types

- [`SequentialLockArgumentType`](src/type/sequential-lock-argument.type.ts) — argument accepted by sequential factories; supports `signal` for abort.
- [`ExclusiveLockArgumentType`](src/type/exclusive-lock-argument.type.ts) — argument accepted by exclusive factories; key-only, no wait options.
- [`LockArgumentType`](src/type/lock-argument.type.ts) — union alias for backwards compatibility.
- [`LockModeType`](src/type/lock-mode.type.ts) — `'sequential' | 'exclusive'`.
- [`PromiseMethodDecoratorType`](src/type/promise-method-decorator.type.ts) — method decorator constrained to `Promise`-returning methods.

## Interfaces

- [`AcquireOptionsInterface`](src/interface/acquire-options.interface.ts) — `{ timeoutMs?, signal? }`.
- [`LockHandleInterface`](src/interface/lock-handle.interface.ts) — handle returned by `store.acquire`.
- [`LockStoreInterface`](src/interface/lock-store.interface.ts) — contract for custom store implementations.
- [`CreateLockOptionsInterface`](src/interface/create-lock-options.interface.ts) — options passed to factory creators.

## License

This library is licensed under The [MIT License](./LICENSE.md).
