# @LockPromise decorator (deprecated)

> **Deprecated.** Use [`createPromiseLockDecorators`](../create-promise-lock-decorators/create-promise-lock-decorators.md) instead.
> This decorator requires class inheritance from `LockableService` and will be removed in a future version.

Class property decorator that locks the ***async*** method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

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
