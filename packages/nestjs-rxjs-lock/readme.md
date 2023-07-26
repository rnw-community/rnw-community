# NestJSRxJSLockModule

[NestJS](https://github.com/nestjs/nest) [RxJS](https://github.com/ReactiveX/rxjs) implementation of distributed lock for
NestJS
using [Redlock](https://github.com/mike-marcacci/node-redlock)

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-lock.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-lock)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-lock.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-lock)

## TODO

-   [] Add module tests
-   [] Remove `nestjs-redis` dependency, use ioredis directly
-   [] Add `lock$` docs usage example

## Installation

Add `@rnw-community/nestjs-rxjs-lock` to your project using you package manager of choice.

## Configuration

We need to create own LockModule to "wrap" typed module and service returned from
the `NestJSRxJSLockModule.registerTypedAsync()`, this will
allow us to use typesafe `LockCodesEnum` in our business logic.

```typescript
// eslint-disable-next-line max-classes-per-file
import { Injectable, Module } from '@nestjs/common';

import { NestJSRxJSLockModule } from '@rnw-community/nestjs-rxjs-lock';
import { LockCodesEnum } from '@seezona/admin-api-backend/src/generic/enum/lock-codes.enum';

// Create a enum which would be typesafe to use in your locks
enum LockCodesEnum {
    DB_USER_CREATE = 'DB_USER_CREATE',
}

const [BaseLockModule, BaseLockService] = NestJSRxJSLockModule.registerTypedAsync<LockCodesEnum>({
    retryCount: 3,
    defaultExpireMs: 5000,
});

@Injectable()
export class LockService extends BaseLockService {}

@Module({
    imports: [BaseLockModule],
    providers: [LockService],
    exports: [LockService],
})
export class LockModule {}
```

## Methods

### NestJSRxJSLockModule.registerTypedAsync

-   `options` is a `NestJSRxJSLockModuleOptions` which extends [Redlock.Options](https://www.npmjs.com/package/redlock) object
    with [default values](src/nestjs-rxjs-lock-module.options.ts)):
    -   `retryCount` is a number of lock attempts
    -   `defaultExpireMs` is a default lock expiration time in milliseconds

##### Example(see [Setup](#setup) section for more details

### NestJSRxJSService.lock$

#### Arguments

-   `name` - unique lock identifier like user id in our setup example
-   `prefix` - typesafe `LockCodesEnum` value from the setup, used as a prefix for the lock key
-   `handler$` - business logic wrapped in RxJS observable
-   `expireMs` - lock expiration time in milliseconds, a module configuration default value is used if not provided

> Redis lock key will be formed as `lock:[prefix]:[name]` and will be expired after `expireMs` milliseconds and wil
> retry `retryCount` times.

#### Usage

```typescript
@Injectable()
export class MyUserService {
    constructor(private readonly lock: LockService /*...other dependencies...*/) {}

    createUserInDb$(user): Observable<User> {
        // business logic
    }

    createUser$(user: User): Observable<User> {
        return this.lock.lock$(user.id, LockCodesEnum.DB_USER_CREATE, () => this.createUserInDb$(user));
    }
}
```

> `lock$` method will throw an error if lock is not acquired

## License

This library is licensed under The [MIT License](./LICENSE.md).
