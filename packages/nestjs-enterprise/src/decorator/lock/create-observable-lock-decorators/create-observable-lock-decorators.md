# `createObservableLockDecorators`

Factory that creates **Observable-based** lock decorators bound to any injectable `LockServiceInterface` via NestJS DI.

Returns `{ SequentialLock$, ExclusiveLock$ }` decorators:

| Decorator | Behavior | Lock method |
|---|---|---|
| `SequentialLock$` | Waits for the lock, then executes | `acquire` |
| `ExclusiveLock$` | Completes with `EMPTY` if locked | `tryAcquire` |

> No class inheritance required. Works with any injectable service that implements `LockServiceInterface`.

## Setup

### 1. Implement the lock service

```ts
import { Injectable } from '@nestjs/common';
import type { LockHandle, LockServiceInterface } from '@rnw-community/nestjs-enterprise';
import Redlock from 'redlock';

@Injectable()
class MyLockService implements LockServiceInterface {
    constructor(private readonly redlock: Redlock) {}

    async acquire(resources: string[], duration: number): Promise<LockHandle> {
        return this.redlock.acquire(resources, duration);
    }

    async tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined> {
        try {
            return await this.redlock.acquire(resources, duration, { retryCount: 0 });
        } catch {
            return undefined;
        }
    }
}
```

### 2. Create decorators

```ts
import { createObservableLockDecorators } from '@rnw-community/nestjs-enterprise';

const { SequentialLock$, ExclusiveLock$ } = createObservableLockDecorators(MyLockService, 5000);

export { SequentialLock$, ExclusiveLock$ };
```

> `defaultDuration` (2nd argument) sets the lock TTL for all decorators. Individual decorators can override it.
>
> Each factory call creates a unique DI binding. Multiple factories with different services can coexist on the same class.

### 3. Use decorators

```ts
import { Injectable } from '@nestjs/common';
import { SequentialLock$, ExclusiveLock$ } from './lock-decorators';
import { of } from 'rxjs';

@Injectable()
class OrderService {
    @SequentialLock$(['order-create'])
    createOrder$(dto: OrderDto): Observable<Order> {
        return this.orderRepo.create$(dto);
    }

    @ExclusiveLock$(dto => ['order-sync', dto.id])
    syncOrder$(dto: OrderDto): Observable<void> {
        // Completes with EMPTY if another sync for this order is already running
    }

    @SequentialLock$(['long-task'], undefined, 30000)
    longRunningTask$(): Observable<void> {
        // Override duration for this specific method
    }
}
```

## API

```ts
createObservableLockDecorators(serviceToken, defaultDuration)
```

| Param | Type | Description |
|---|---|---|
| `serviceToken` | `AbstractConstructor<LockServiceInterface>` | Injectable lock service class |
| `defaultDuration` | `number` | Default lock TTL in milliseconds for all decorators |

```ts
@SequentialLock$(preLock, catchErrorFn$?, duration?)
@ExclusiveLock$(preLock, catchErrorFn$?, duration?)
```

| Param | Type | Description |
|---|---|---|
| `preLock` | `string[] \| (...args) => string[]` | Lock keys, static or derived from method arguments |
| `catchErrorFn$` | `(error: unknown) => Observable<T>` | Optional error handler, returned Observable replaces the error |
| `duration` | `number` | Lock TTL override, defaults to factory `defaultDuration` |

### preLock

Static keys or a type-safe function that receives the decorated method's arguments:

```ts
@SequentialLock$(['resource-key'])
@SequentialLock$((id, type) => [`resource-${type}`, String(id)])
```

### catchErrorFn$

```ts
@SequentialLock$(['key'], error => {
    console.error('Lock failed', error);
    return EMPTY;
})
```

## Behavior

### SequentialLock$

1. `defer(() => acquire(keys, duration))` - lazy, waits/retries until lock is obtained
2. `concatMap` into the decorated method's Observable
3. `finalize(() => release())` on completion or error
4. If `catchErrorFn$` provided, `catchError` pipes into its result

### ExclusiveLock$

1. `defer(() => tryAcquire(keys, duration))` - lazy, single attempt
2. If lock is held by another process, completes with `EMPTY` immediately
3. If acquired, `concatMap` into the decorated method's Observable
4. `finalize(() => release())` on completion or error
