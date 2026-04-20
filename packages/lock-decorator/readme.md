# Lock Decorator

Framework-agnostic sequential and exclusive method lock decorators. TypeScript `experimentalDecorators`. Dual ESM + CJS.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flock-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flock-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flock-decorator.svg)](https://www.npmjs.com/package/%40rnw-community/lock-decorator)

## Async-only

Both factories require the decorated method to return a `Promise`. The factory's `K` generic is constrained to `(...args) => Promise<unknown>`, so applying either to a sync method is a compile-time error. A runtime guard catches any cast-bypassed mismatch.

For `Observable` pipelines under a lock, use `runWithLock$` — also exported from this package.

## Factories

### [createSequentialLockDecorator](src/factory/create-sequential-lock-decorator/create-sequential-lock-decorator.ts)

FIFO queue on the key. Supports `timeoutMs` (→ `LockAcquireTimeoutError`) and `AbortSignal` (→ `DOMException('AbortError')`).

```ts
import { createSequentialLockDecorator, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const SequentialLock = createSequentialLockDecorator({ store: createInMemoryLockStore() });

class DataService {
    @SequentialLock('fetch-data')
    async fetchData(): Promise<void> { /* ... */ }

    @SequentialLock(args => `price:${args[0]}`)
    async updatePrice(sku: string): Promise<void> { /* ... */ }
}
```

Key-fn `args` is inferred from the method signature — no annotations needed.

### [createExclusiveLockDecorator](src/factory/create-exclusive-lock-decorator/create-exclusive-lock-decorator.ts)

Rejects immediately with `LockBusyError` if the key is held. No waiting, no timeout, no signal — skip-on-busy semantics.

```ts
import { createExclusiveLockDecorator, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const ExclusiveLock = createExclusiveLockDecorator({ store: createInMemoryLockStore() });

class Cache {
    @ExclusiveLock('cache-write')
    async write(value: string): Promise<void> { /* ... */ }
}
```

## RxJS — [`runWithLock$`](src/util/run-with-lock-rxjs/run-with-lock-rxjs.ts)

Observable helper that acquires, subscribes, and releases on complete / error / unsubscribe. Bridges an external `AbortSignal` and cleans up its listener on teardown.

```ts
import { runWithLock$, createInMemoryLockStore } from '@rnw-community/lock-decorator';

const store = createInMemoryLockStore();
const result$ = runWithLock$(store, 'stream-key', 'sequential', { timeoutMs: 1000 }, () => source$);
```

## Store

### [createInMemoryLockStore](src/store/create-in-memory-lock-store/create-in-memory-lock-store.ts)

Single-process FIFO chain + exclusive set. Terminal waiters (timeout / abort) clean up the chain map when they still own the tail, so the store does not retain dead entries.

```ts
const store = createInMemoryLockStore();
const handle = await store.acquire('my-key', 'sequential', { timeoutMs: 3000 });
handle.release();
```

## Errors

- [`LockBusyError`](src/error/lock-busy-error/lock-busy.error.ts) — exclusive key already held
- [`LockAcquireTimeoutError`](src/error/lock-acquire-timeout-error/lock-acquire-timeout.error.ts) — sequential `timeoutMs` expired

## Types & interfaces

- [`SequentialLockArgumentType`](src/type/sequential-lock-argument.type.ts) / [`ExclusiveLockArgumentType`](src/type/exclusive-lock-argument.type.ts) — string key, key-fn, or object form
- [`LockModeType`](src/type/lock-mode.type.ts) — `'sequential' | 'exclusive'`
- [`AcquireOptionsInterface`](src/interface/acquire-options.interface.ts) / [`LockHandleInterface`](src/interface/lock-handle.interface.ts) / [`LockStoreInterface`](src/interface/lock-store.interface.ts)

## License

[MIT](./LICENSE.md)
