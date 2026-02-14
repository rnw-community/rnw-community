# @Lock decorators (deprecated)

> **Deprecated.** Use the [DI-based lock decorator factories](./create-promise-lock-decorators/create-promise-lock-decorators.md) instead. These decorators require class inheritance from `LockableService` and will be removed in a future version.

Class property decorators that locks the method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

- Promise based methods: [@LockPromise](./lock-promise/lock-promise-decorator.md) (deprecated)
- Observable based methods: [@LockObservable](./lock-observable/lock-observable-decorator.md) (deprecated)

## Migration

Replace `LockableService` inheritance with a DI-injectable `LockServiceInterface`:

**Before:**
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

    @LockPromise(['cats-resource'], 5000)
    async findAll(): Promise<Cat[]> { ... }
}
```

**After:**
```ts
import { Injectable } from '@nestjs/common';
import { createPromiseLockDecorators, type LockServiceInterface, type LockHandle } from '@rnw-community/nestjs-enterprise';

@Injectable()
class MyLockService implements LockServiceInterface {
    constructor(private readonly redlock: Redlock) {}
    async acquire(resources: string[], duration: number): Promise<LockHandle> {
        return this.redlock.acquire(resources, duration);
    }
    async tryAcquire(resources: string[], duration: number): Promise<LockHandle | undefined> {
        try { return await this.redlock.acquire(resources, duration, { retryCount: 0 }); }
        catch { return undefined; }
    }
}

const { SequentialLock } = createPromiseLockDecorators(MyLockService, 5000);

@Injectable()
class CatsService {
    @SequentialLock(['cats-resource'])
    async findAll(): Promise<Cat[]> { ... }
}
```

See:
- [createPromiseLockDecorators](./create-promise-lock-decorators/create-promise-lock-decorators.md)
- [createObservableLockDecorators](./create-observable-lock-decorators/create-observable-lock-decorators.md)
