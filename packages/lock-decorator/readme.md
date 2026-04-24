# Lock Decorator

Framework-agnostic sequential and exclusive method lock decorators. Promise and Observable return shapes both supported. TypeScript `experimentalDecorators`. Dual ESM + CJS. `rxjs` is an optional peer — required only when using the `$`-suffixed Observable factories or `createLockMiddleware$`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flock-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flock-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flock-decorator.svg)](https://www.npmjs.com/package/%40rnw-community/lock-decorator)

## The four decorator factories

|   | Promise-returning methods | Observable-returning methods |
|---|---|---|
| **Sequential** (FIFO queue on key) | `createSequentialLockDecorator` | `createSequentialLockDecorator$` |
| **Exclusive** (skip-on-busy) | `createExclusiveLockDecorator` | `createExclusiveLockDecorator$` |

Each factory takes `{ store }: CreateLockOptionsInterface` and returns a decorator factory that accepts the same key argument shape (string, `(args) => string`, or `{ key, timeoutMs?, signal? }` for sequential; `{ key }` only for exclusive — exclusive does not wait, so timeout/signal make no sense).

## Sequential (Promise)

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

    @SequentialLock({ key: 'payment', timeoutMs: 5000 })
    async charge(amount: number): Promise<string> { /* ... */ }
}
```

Key-fn `args` is inferred from the method signature — no annotations needed. The `K` generic constrains the decorated method to `(...args) => Promise<unknown>`; sync methods fail at compile time and, if cast-bypassed, reject at runtime.

## Exclusive (Promise)

Rejects immediately with `LockBusyError` if the key is held. No waiting, no timeout, no signal.

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

## Observable variants — `$` factories

For methods that return `Observable<T>`, use `createSequentialLockDecorator$` / `createExclusiveLockDecorator$`. Same store contract, same key-argument shapes. The acquired handle is released on the inner Observable's `complete`, `error`, or `unsubscribe` — the lock tracks the subscription lifecycle.

```ts
import { createSequentialLockDecorator$ } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';
import type { Observable } from 'rxjs';

declare const store: LockStoreInterface;

const SequentialLock$ = createSequentialLockDecorator$({ store });

class StreamService {
    @SequentialLock$({ key: 'feed', timeoutMs: 1000 })
    subscribe$(symbol: string): Observable<number> { /* ... */ }
}
```

## Raw middleware (`createLockMiddleware` / `createLockMiddleware$`)

If you are building a custom decorator (for example a DI-aware NestJS adapter), consume the raw middleware directly and feed it into your own `createInterceptor({ middleware })` call:

```ts
import { createInterceptor } from '@rnw-community/decorators-core';
import { createLockMiddleware$ } from '@rnw-community/lock-decorator';
```

`createLockMiddleware(store, mode, arg)` returns an `InterceptorMiddleware<TArgs>` for Promise methods; `createLockMiddleware$` returns one for Observable methods and additionally bridges an external `AbortSignal` through to the store. Both are used internally by the four factories above.

## Store contract

Bring your own [`LockStoreInterface`](src/interface/lock-store.interface.ts) implementation — Redis, in-process, cluster-aware, whatever fits the deployment target. The contract is a single method:

```ts
interface LockStoreInterface {
    acquire: (key: string, mode: LockModeType, options?: AcquireOptionsInterface) => Promise<LockHandleInterface>;
}

interface LockHandleInterface {
    readonly key: string;
    readonly mode: LockModeType;
    release: () => void | Promise<void>;
}
```

The store returns a handle; the handle releases itself. A minimal adapter is typically a few dozen lines.

## Errors

- [`LockBusyError`](src/error/lock-busy-error/lock-busy.error.ts) — exclusive key already held
- [`LockAcquireTimeoutError`](src/error/lock-acquire-timeout-error/lock-acquire-timeout.error.ts) — sequential `timeoutMs` expired

## Types & interfaces

- [`SequentialLockArgumentType<TArgs>`](src/type/sequential-lock-argument.type.ts) — `string | ((args: TArgs) => string) | { key, timeoutMs?, signal? }`
- [`ExclusiveLockArgumentType<TArgs>`](src/type/exclusive-lock-argument.type.ts) — `string | ((args: TArgs) => string) | { key }`
- [`LockArgumentType<TArgs>`](src/type/lock-argument.type.ts) — union of the two above
- [`LockModeType`](src/type/lock-mode.type.ts) — `'sequential' | 'exclusive'`
- [`AcquireOptionsInterface`](src/interface/acquire-options.interface.ts) — `{ timeoutMs?, signal? }`
- [`CreateLockOptionsInterface`](src/interface/create-lock-options.interface.ts) — `{ store }`

## License

[MIT](https://github.com/rnw-community/rnw-community/blob/master/LICENSE.md)
