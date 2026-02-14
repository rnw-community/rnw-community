# createPromiseLockDecorators

Factory that creates ***Promise-based*** lock decorators bound to any injectable `LockServiceInterface` via NestJS DI.

Returns `{ SequentialLock, ExclusiveLock }` decorators:

| Decorator | Behavior | Lock method |
|---|---|---|
| `SequentialLock` | Waits for the lock, then executes | `acquire` |
| `ExclusiveLock` | Skips execution if locked, returns `undefined` | `tryAcquire` |

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
import { createPromiseLockDecorators } from '@rnw-community/nestjs-enterprise';

const { SequentialLock, ExclusiveLock } = createPromiseLockDecorators(MyLockService, 5000);

export { SequentialLock, ExclusiveLock };
```

> `defaultDuration` (2nd argument) sets the lock TTL for all decorators. Individual decorators can override it.
>
> Each factory call creates a unique DI binding. Multiple factories with different services can coexist on the same class.

### 3. Use decorators

```ts
import { Injectable } from '@nestjs/common';
import { SequentialLock, ExclusiveLock } from './lock-decorators';

@Injectable()
class OrderService {
    @SequentialLock(['order-create'])
    async createOrder(dto: OrderDto): Promise<Order> {
        return this.orderRepo.create(dto);
    }

    @ExclusiveLock(dto => ['order-sync', dto.id])
    async syncOrder(dto: OrderDto): Promise<void> {
        // Skipped if another sync for this order is already running
    }

    @SequentialLock(['long-task'], undefined, 30000)
    async longRunningTask(): Promise<void> {
        // Override duration for this specific method
    }
}
```

## API

```ts
createPromiseLockDecorators(serviceToken, defaultDuration)
```

| Param | Type | Description |
|---|---|---|
| `serviceToken` | `AbstractConstructor<LockServiceInterface>` | Injectable lock service class |
| `defaultDuration` | `number` | Default lock TTL in milliseconds for all decorators |

```ts
@SequentialLock(preLock, catchErrorFn?, duration?)
@ExclusiveLock(preLock, catchErrorFn?, duration?)
```

| Param | Type | Description |
|---|---|---|
| `preLock` | `string[] \| (...args) => string[]` | Lock keys, static or derived from method arguments |
| `catchErrorFn` | `(error: unknown) => T` | Optional error handler, return value becomes method result |
| `duration` | `number` | Lock TTL override, defaults to factory `defaultDuration` |

### preLock

Static keys or a type-safe function that receives the decorated method's arguments:

```ts
@SequentialLock(['resource-key'])
@SequentialLock((id, type) => [`resource-${type}`, String(id)])
```

### catchErrorFn

```ts
@SequentialLock(['key'], error => {
    console.error('Lock failed', error);
    return fallbackValue;
})
```

## Behavior

### SequentialLock

1. `acquire(keys, duration)` - waits/retries until lock is obtained
2. Executes the decorated method
3. `release()` in `finally` block
4. If `catchErrorFn` provided, catches errors and returns its result

### ExclusiveLock

1. `tryAcquire(keys, duration)` - single attempt, no retry
2. If lock is held by another process, returns `undefined` immediately
3. If acquired, executes the decorated method
4. `release()` in `finally` block
