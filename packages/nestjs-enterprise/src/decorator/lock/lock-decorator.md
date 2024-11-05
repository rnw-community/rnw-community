# @Lock decorators

Class property decorators that locks the method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

> Due to JS nature we cannot have single decorator that will work for both sync and async methods, so we have 2 different decorators for each case
>
> Each decorator will convert method returned value to *Promise* or *Observable* because locking is async.

- Promise based methods: [@LockPromise](./lock-promise/lock-promise-decorator.md)
- Observable based methods: [@LockObservable](./lock-observable/lock-observable-decorator.md)

# Usage
To use the decorators you need to provide `redlock` instance during runtime. Decorator has a runtime check and throws an error if `redlock` is not provided.

To simplify the usage you can extend your service from `LockableService` that will provide `redlock` instance for you,
only [IORedis](https://github.com/redis/ioredis) instance is required to be provided during runtime.

```ts
import { Injectable } from '@nestjs/common';
import { LockableService } from '@rnw-community/nestjs-enterprise';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { of } from 'rxjs'

@Injectable()
class CatsService extends LockableService {
    constructor(@InjectRedis() readonly redis: Redis) {
        super(redis, { retryCount: 0 });
    }
}
```
