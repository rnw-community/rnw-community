# @LockObservable decorator

Class property decorator that locks the ***observable*** [rxjs](https://rxjs.dev/) method execution based on the provided key using [Redlock](https://github.com/mike-marcacci/node-redlock) and [IORedis](https://github.com/redis/ioredis).

> Decorator is relying on the `redlock` class property that should be provided during runtime.

## Usage

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

### PreLock
Decorator accepts ***string array*** or a ***function that returns a string array*** as a first argument

> Method arguments will be passed to the function if it is provided, type safe

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

    @LockObservable(id => ['cats-resource', id], 100)
    findById$(id: number) {
        return of('This action returns all cats');
    }
}
```

### catchErrorFn$
Decorator accepts a `catchErrorFn` function that will be called in case of the lock error, you can return an observable that will be returned from the method
or throw an error, or process the error in any other way.

```ts
import { Injectable } from '@nestjs/common';
import { LockObservable, LockableService } from '@rnw-community/nestjs-enterprise';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { of, EMPTY } from 'rxjs'

@Injectable()
class CatsService extends LockableService {
    constructor(@InjectRedis() readonly redis: Redis) {
        super(redis, { retryCount: 0 });
    }

    @LockObservable(['cats-resource'], 100, error => {
        console.error('Lock error', error)
        return EMPTY
    })
    consoleExample$() {
        return of('This action returns all cats');
    }

    @LockObservable(id => ['cats-resource', id], 100, error => EMPTY)
    noopExample$(id: number) {
        return of('This action returns all cats');
    }

    @LockObservable(id => ['cats-resource', id], 100, error => throwError(new Error('My error')))
    rethrowAnotherErrorExample$(id: number) {
        return of('This action returns all cats');
    }
}
```
