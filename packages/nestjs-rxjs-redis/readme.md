# NestJS RxJS Redis

NestJS redis wrapper for using with RxJS streams.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-redis.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-redis)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=nestjs-rxjs-redis&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-redis.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-redis)

## NestJSRxJSRedisModule

Global NestJS module that registers the redis connection (via `@nestjs-modules/ioredis`) and provides
`NestJSRxJSRedisService`. Register it once with `forRootAsync`, which accepts the `RedisModuleAsyncOptions` of
`@nestjs-modules/ioredis` (`useFactory` / `useClass` / `useExisting`, `inject`, `imports`):

```ts
import { Module } from '@nestjs/common';

import { NestJSRxJSRedisModule } from '@rnw-community/nestjs-rxjs-redis';

@Module({
    imports: [
        NestJSRxJSRedisModule.forRootAsync({
            useFactory: () => ({ type: 'single', url: 'redis://localhost:6379' }),
        }),
    ],
})
export class AppModule {}
```

## NestJSRxJSRedisService

Injectable service exposing redis commands as RxJS observables and pipeable operators. Every command maps a redis
failure to an `Error` carrying the optional custom message argument:

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSRedisService } from '@rnw-community/nestjs-rxjs-redis';

@Injectable()
export class MyService {
    constructor(private readonly redis: NestJSRxJSRedisService) {}
}
```

### Basic operations

-   `set$(key, value, ttlInSeconds, error?)` - sets a string value with an expiry, emits `true`
-   `get$(key, error?)` - emits the stored string, errors when the key is missing
-   `del$(key, error?)` - deletes a key, emits the number of removed keys
-   `ttl$(key, error?)` - emits the remaining time to live of a key in seconds
-   `expire$(key, seconds, error?)` - sets a timeout on a key, emits `1` when set and `0` otherwise
-   `incr$(key, error?)` - increments a numeric key, emits the new value
-   `mget$(keys)` - emits a record mapping every requested key to its value (or `null`)

```ts
import { Injectable } from '@nestjs/common';

import { NestJSRxJSRedisService } from '@rnw-community/nestjs-rxjs-redis';

import type { Observable } from 'rxjs';

@Injectable()
export class MyService {
    constructor(private readonly redis: NestJSRxJSRedisService) {}

    setExample$(): Observable<boolean> {
        return this.redis.set$('my-redis-key', 'value', 60, 'Cannot save value');
    }

    getExample$(): Observable<string> {
        return this.redis.get$('my-redis-key', 'Cannot get key');
    }

    delExample$(): Observable<number> {
        return this.redis.del$('my-redis-key', 'Cannot delete key');
    }

    ttlExample$(): Observable<number> {
        return this.redis.ttl$('my-redis-key', 'Cannot get key ttl');
    }

    expireExample$(): Observable<number> {
        return this.redis.expire$('my-redis-key', 120, 'Cannot set key timeout');
    }

    incrExample$(): Observable<number> {
        return this.redis.incr$('my-redis-counter', 'Cannot increment counter');
    }

    multipleGetExample$(): Observable<Record<'my-redis-key-1' | 'my-redis-key-2', string | null>> {
        return this.redis.mget$(['my-redis-key-1', 'my-redis-key-2']);
    }
}
```

### save

`save(keyFn, ttlInSeconds, errorFn?, toValueFn?)` receives a value from the RxJS stream, passes it to `keyFn` to
generate a data-related redis key, converts the data to a string using `toValueFn` (`JSON.stringify` by default),
saves it to redis and re-emits the original value.

```ts
export class MyService {
    saveExample$(): Observable<number> {
        return of(9999).pipe(
            this.redis.save(
                data => `redis-key-${data}`,
                60,
                data => `Cannot save ${data} to redis`
            )
        );
    }
}
```

### load

`load(keyFn?, errorFn?, fromValueFn?)` receives a key from the RxJS stream, passes it to `keyFn` to generate the redis
key, retrieves the value from redis and converts it using `fromValueFn` (`JSON.parse` by default).

```ts
export class MyService {
    loadExample$(): Observable<MyType> {
        return of('my-redis-key').pipe(
            this.redis.load<MyType>(
                key => `${key}-modified`,
                key => `Cannot load ${key} from redis`
            )
        );
    }
}
```

### remove

`remove(keyFn?, errorFn?)` receives a key from the RxJS stream, passes it to `keyFn` to generate the redis key,
deletes that key in redis and re-emits the original value.

```ts
export class MyService {
    removeExample$(): Observable<string> {
        return of('my-redis-key').pipe(
            this.redis.remove(
                key => `${key}-modified`,
                key => `Cannot remove ${key} from redis`
            )
        );
    }
}
```

### cache

`cache(ttlInSeconds, prepareFn$, keyFn?, fromValueFn?, toValueFn?)` loads data from redis by the key produced by
`keyFn`; if it is not available, executes `prepareFn$` with that key, saves the returned data to redis for
`ttlInSeconds` and emits it.

```ts
export class MyService {
    cacheExample$(): Observable<MyType> {
        return of('my-redis-key').pipe(
            this.redis.cache<MyType>(
                60,
                key => this.repository.findByKey$(key),
                input => `${input}-modified`
            )
        );
    }
}
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
