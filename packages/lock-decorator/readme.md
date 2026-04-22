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
import { createSequentialLockDecorator } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';

declare const store: LockStoreInterface;

const SequentialLock = createSequentialLockDecorator({ store });

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
import { createExclusiveLockDecorator } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';

declare const store: LockStoreInterface;

const ExclusiveLock = createExclusiveLockDecorator({ store });

class Cache {
    @ExclusiveLock('cache-write')
    async write(value: string): Promise<void> { /* ... */ }
}
```

## Store

Bring your own [`LockStoreInterface`](src/interface/lock-store.interface.ts) implementation — Redis, in-process, cluster-aware, whatever fits the deployment target. The interface is a two-method contract (`acquire(key, mode, options)` returning `LockHandleInterface`), so a minimal adapter is usually a few dozen lines.

## Errors

- [`LockBusyError`](src/error/lock-busy-error/lock-busy.error.ts) — exclusive key already held
- [`LockAcquireTimeoutError`](src/error/lock-acquire-timeout-error/lock-acquire-timeout.error.ts) — sequential `timeoutMs` expired

## Types & interfaces

- [`SequentialLockArgumentType`](src/type/sequential-lock-argument.type.ts) / [`ExclusiveLockArgumentType`](src/type/exclusive-lock-argument.type.ts) — string key, key-fn, or object form
- [`LockModeType`](src/type/lock-mode.type.ts) — `'sequential' | 'exclusive'`
- [`AcquireOptionsInterface`](src/interface/acquire-options.interface.ts) / [`LockHandleInterface`](src/interface/lock-handle.interface.ts) / [`LockStoreInterface`](src/interface/lock-store.interface.ts)

## License

[MIT](./LICENSE.md)
