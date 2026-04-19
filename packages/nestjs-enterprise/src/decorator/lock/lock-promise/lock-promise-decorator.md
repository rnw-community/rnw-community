# @LockPromise decorator (deprecated)

> **Deprecated.** Use [`createPromiseLockDecorators`](../create-promise-lock-decorators/create-promise-lock-decorators.md) instead.
> This decorator requires class inheritance from `LockableService` and will be removed in a future version.

Class property decorator that locks the ***async*** method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

> **Exclusive-on-busy contract.** When `LockPromise` behaves as exclusive (e.g., the underlying service returns `undefined` on contention), the decorated method resolves to `undefined` even though the return type still reads as `Promise<T>`. This matches the modern `ExclusiveLock` behavior in [`createPromiseLockDecorators`](../create-promise-lock-decorators/create-promise-lock-decorators.md); supply a `catchErrorFn` or type the method as `Promise<T | undefined>` if callers cannot accept the skipped-execution no-op.

## Migration

```diff
- import { LockPromise, LockableService } from '@rnw-community/nestjs-enterprise';
+ import { createPromiseLockDecorators } from '@rnw-community/nestjs-enterprise';
+
+ const { SequentialLock, ExclusiveLock } = createPromiseLockDecorators(MyLockService, 5000);

  @Injectable()
- class CatsService extends LockableService {
-     constructor(@InjectRedis() readonly redis: Redis) {
-         super(redis, { retryCount: 0 });
-     }
-
-     @LockPromise(['cats-resource'], 5000)
+ class CatsService {
+     @SequentialLock(['cats-resource'])
      async findAll(): Promise<Cat[]> { ... }
  }
```

## Legacy usage

```ts
import { Injectable } from '@nestjs/common';
import { LockPromise, LockableService } from '@rnw-community/nestjs-enterprise';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
class CatsService extends LockableService {
    constructor(@InjectRedis() readonly redis: Redis) {
        super(redis, { retryCount: 0 });
    }

    @LockPromise(['cats-resource'], 100)
    findAll() {
        return 'This action returns all cats';
    }
}
```
