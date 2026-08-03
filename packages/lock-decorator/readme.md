# Lock Decorator

Framework-agnostic sequential and exclusive method lock decorators. Promise and Observable return shapes both supported. TypeScript `experimentalDecorators`. Dual ESM + CJS. `rxjs` is an optional peer — required only when using the `$`-suffixed Observable factories or `createLockMiddleware$`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flock-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flock-decorator)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=lock-decorator&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flock-decorator.svg)](https://www.npmjs.com/package/%40rnw-community/lock-decorator)

## The four decorator factories

|   | Promise-returning methods | Observable-returning methods |
|---|---|---|
| **Sequential** (FIFO queue on key) | `createSequentialLockDecorator` | `createSequentialLockDecorator$` |
| **Exclusive** (skip-on-busy) | `createExclusiveLockDecorator` | `createExclusiveLockDecorator$` |

Each factory takes `{ store }: CreateLockOptionsInterface` and returns a decorator factory that accepts the same key argument shape (string, `(args) => string`, or `{ key, timeoutMs?, signal? }` for sequential; `{ key }` only for exclusive — exclusive does not wait, so timeout/signal make no sense).

## Sequential (Promise)

### `createSequentialLockDecorator`

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

### `createExclusiveLockDecorator`

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

### `createSequentialLockDecorator$`

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

### `createExclusiveLockDecorator$`

```ts
import { createExclusiveLockDecorator$ } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';
import type { Observable } from 'rxjs';

declare const store: LockStoreInterface;

const ExclusiveLock$ = createExclusiveLockDecorator$({ store });

class StreamService {
    @ExclusiveLock$({ key: 'feed' })
    subscribe$(symbol: string): Observable<number> { /* ... */ }
}
```

## Raw middleware

If you are building a custom decorator (for example a DI-aware NestJS adapter), consume the raw middleware directly and feed it into your own `createInterceptor({ middleware })` call. Both are used internally by the four factories above.

### `createLockMiddleware`

Returns an `InterceptorMiddleware<TArgs>` for Promise-returning methods:

```ts
import { createInterceptor } from '@rnw-community/decorators-core';
import { createLockMiddleware } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';

declare const store: LockStoreInterface;

const withSequentialLock = createInterceptor({ middleware: createLockMiddleware(store, 'sequential', 'my-key') });
```

### `createLockMiddleware$`

Returns an `InterceptorMiddleware<TArgs, Observable<unknown>>` for Observable-returning methods, and additionally bridges an external `AbortSignal` through to the store:

```ts
import { createInterceptor } from '@rnw-community/decorators-core';
import { createLockMiddleware$ } from '@rnw-community/lock-decorator';

import type { LockStoreInterface } from '@rnw-community/lock-decorator';

declare const store: LockStoreInterface;

const withSequentialLock$ = createInterceptor({ middleware: createLockMiddleware$(store, 'sequential', 'my-key') });
```

## Store contract

Bring your own `LockStoreInterface` implementation — Redis, in-process, cluster-aware, whatever fits the deployment target. The store returns a handle; the handle releases itself. A minimal adapter is typically a few dozen lines.

### `LockStoreInterface`

```ts
import type { LockStoreInterface } from '@rnw-community/lock-decorator';

const store: LockStoreInterface = {
    acquire: async (key, mode, options) => ({
        key,
        mode,
        release: async () => { /* ... */ },
    }),
};
```

### `LockHandleInterface`

The handle returned by `LockStoreInterface.acquire`; the four factories call `release()` for you.

```ts
import type { LockHandleInterface } from '@rnw-community/lock-decorator';

const handle: LockHandleInterface = { key: 'my-key', mode: 'sequential', release: () => undefined };
```

### `AcquireOptionsInterface`

`{ timeoutMs?: number; signal?: AbortSignal }` — the third argument to `LockStoreInterface.acquire`.

```ts
import type { AcquireOptionsInterface } from '@rnw-community/lock-decorator';

const options: AcquireOptionsInterface = { timeoutMs: 5000 };
```

### `LockModeType`

`'sequential' | 'exclusive'` — passed to `LockStoreInterface.acquire` so the store knows which semantics to apply.

```ts
import type { LockModeType } from '@rnw-community/lock-decorator';

const mode: LockModeType = 'sequential';
```

### `CreateLockOptionsInterface`

`{ store: LockStoreInterface }` — the sole argument to all four factories.

```ts
import { createSequentialLockDecorator } from '@rnw-community/lock-decorator';

import type { CreateLockOptionsInterface, LockStoreInterface } from '@rnw-community/lock-decorator';

declare const store: LockStoreInterface;

const options: CreateLockOptionsInterface = { store };
const SequentialLock = createSequentialLockDecorator(options);
```

## Errors

### `LockBusyError`

Thrown by `createExclusiveLockDecorator` / `createExclusiveLockDecorator$` when the key is already held.

```ts
import { LockBusyError } from '@rnw-community/lock-decorator';

try {
    await cache.write(value);
} catch (error) {
    if (error instanceof LockBusyError) {
        console.warn(`busy: ${error.key}`);
    }
}
```

### `LockAcquireTimeoutError`

Thrown by `createSequentialLockDecorator` / `createSequentialLockDecorator$` when `timeoutMs` elapses before the key becomes free.

```ts
import { LockAcquireTimeoutError } from '@rnw-community/lock-decorator';

try {
    await service.charge(amount);
} catch (error) {
    if (error instanceof LockAcquireTimeoutError) {
        console.warn(`timed out after ${error.timeoutMs}ms for ${error.key}`);
    }
}
```

## Key-argument types

### `SequentialLockArgumentType<TArgs>`

Accepted key shapes for `createSequentialLockDecorator` / `createSequentialLockDecorator$`:

```ts
import type { SequentialLockArgumentType } from '@rnw-community/lock-decorator';

const byId: SequentialLockArgumentType<[id: string]> = ([id]) => `order:${id}`;
```

### `ExclusiveLockArgumentType<TArgs>`

Accepted key shapes for `createExclusiveLockDecorator` / `createExclusiveLockDecorator$` — no `timeoutMs`/`signal`, exclusive locks never wait:

```ts
import type { ExclusiveLockArgumentType } from '@rnw-community/lock-decorator';

const byId: ExclusiveLockArgumentType<[id: string]> = ([id]) => ({ key: `cache:${id}` });
```

### `LockArgumentType<TArgs>`

`SequentialLockArgumentType<TArgs> | ExclusiveLockArgumentType<TArgs>` — the union accepted internally by `createLockMiddleware` / `createLockMiddleware$`.

```ts
import type { LockArgumentType } from '@rnw-community/lock-decorator';

const arg: LockArgumentType<[id: string]> = 'static-key';
```

## License

[MIT](https://github.com/rnw-community/rnw-community/blob/master/LICENSE.md)
