# NestJS RxJS Redis

NestJS redis wrapper for using with RxJS streams.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-redis.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-redis)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-redis.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-redis)

## Configuration

Import `NestJSRxJSRedisModule` into your module:

```ts
import { Module } from '@nestjs/common';
import { NestJSRxJSRedisModule } from '@rnw-community/nestjs-rxjs-redis';

@Module({
    imports: [NestJSRxJSRedisModule],
    providers: [],
    exports: [],
})
export class MyModule {}
```

Inject `NestJSRxJSRedisService` into your service:

```ts
import { Injectable } from '@nestjs/common';
import { NestJSRxJSRedisService } from '@rnw-community/nestjs-rxjs-redis';

@Injectable()
export class MyService {
    constructor(private readonly redis: NestJSRxJSRedisService) {}
}
```

## Basic operations examples

```ts
import { Injectable } from '@nestjs/common';
import { NestJsRxjsLoggerService } from '@rnw-community/nestjs-rxjs-logger';

@Injectable()
export class MyService {
    constructor(private readonly redis: NestJSRxJSRedisService) {}

    setExample$(): Observable<boolean> {
        return this.redis.set$('my-redis-key', 'value', 60, 'Cannot save value');
    }

    getExample$(): Observable<boolean> {
        return this.redis.get$('my-redis-key', 'Cannot get key');
    }

    delExample$(): Observable<boolean> {
        return this.redis.del$('my-redis-key', 'Cannot delete key');
    }

    multipleGetEample$(): Observable<boolean> {
        return this.redis.mget$(['my-redis-key-1', 'my-redis-key-2']);
    }
}
```

## Operator examples

### Save

This operator receives a value from RxJS stream, passes it to keyFn handler for
generating data-related redis key and converts data to string using toValueFn and.
saves this string to redis.

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

### Load

This operator receives a key from RxJS stream, passes it to keyFn handler for
generating redis key, retrieves a keys from redis and converts data from string using fromValueFn.

```ts
export class MyService {
    loadExample$(): Observable<MyType> {
        return of('my-redis-key').pipe(
            this.redis.load<MyType>(
                key => `${key}-modified`,
                key => `Cannot save ${key} to redis`
            )
        );
    }
}
```

### Remove

This operator receives a key from RxJS stream, passes it to keyFn handler for
generating redis key and deletes a key in redis.

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

### LoadAndSave

This operator loads data from redis and if data is not available
executes prepareFn$ handler and saves returned data to redis.

```ts
export class MyService {
    loadAndSaveExample$(): Observable<MyType> {
        return of('my-redis-key').pipe(
            this.redis.loadAndSave<MyType>(
                60,
                key => of(9999),
                key => `${key}-modified`
            )
        );
    }
}
```
