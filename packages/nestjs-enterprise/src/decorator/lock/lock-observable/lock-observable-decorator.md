# @LockObservable decorator (deprecated)

> **Deprecated.** Use [`createObservableLockDecorators`](../create-observable-lock-decorators/create-observable-lock-decorators.md) instead.
> This decorator requires class inheritance from `LockableService` and will be removed in a future version.

Class property decorator that locks the ***observable*** [rxjs](https://rxjs.dev/) method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

## Migration

```diff
- import { LockObservable, LockableService } from '@rnw-community/nestjs-enterprise';
+ import { createObservableLockDecorators } from '@rnw-community/nestjs-enterprise';
+
+ const { SequentialLock$, ExclusiveLock$ } = createObservableLockDecorators(MyLockService, 5000);

  @Injectable()
- class CatsService extends LockableService {
-     constructor(@InjectRedis() readonly redis: Redis) {
-         super(redis, { retryCount: 0 });
-     }
-
-     @LockObservable(['cats-resource'], 5000)
+ class CatsService {
+     @SequentialLock$(['cats-resource'])
      findAll$(): Observable<Cat[]> { ... }
  }
```

## Legacy usage

```ts
import { Injectable } from '@nestjs/common';
import { LockObservable, LockableService } from '@rnw-community/nestjs-enterprise';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { of } from 'rxjs'

@Injectable()
class CatsService extends LockableService {
    constructor(@InjectRedis() readonly redis: Redis) {
        super(redis, { retryCount: 0 });
    }

    @LockObservable(['cats-resource'], 100)
    findAll$() {
        return of('This action returns all cats');
    }
}
```
