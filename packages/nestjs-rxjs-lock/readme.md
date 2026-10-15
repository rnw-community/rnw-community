# NestJSRxJSLockModule

[NestJS](https://github.com/nestjs/nest) [RxJS](https://github.com/ReactiveX/rxjs) implementation of distributed lock for
NestJS
using [Redlock](https://github.com/mike-marcacci/node-redlock)

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-lock.svg)](https://badge.fury.io/js/%40rnw-community%2Fnestjs-rxjs-lock)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=nestjs-rxjs-lock&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fnestjs-rxjs-lock.svg)](https://www.npmjs.com/package/%40rnw-community%2Fnestjs-rxjs-lock)

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

Returns a `[module, service]` tuple: a NestJS module and an injectable `NestJSRxJSLockService` subclass typed with your
lock-prefix enum.

-   `options` is a `Partial<NestJSRxJSLockModuleOptions>` (see [NestJSRxJSLockModuleOptions](#nestjsrxjslockmoduleoptions)),
    merged over [defaultNestJSRxJSLockModuleOptions](#defaultnestjsrxjslockmoduleoptions)

##### Example (see the [Configuration](#configuration) section for more details)

```typescript
const [BaseLockModule, BaseLockService] = NestJSRxJSLockModule.registerTypedAsync<LockCodesEnum>({ retryCount: 3 });
```

### NestJSRxJSLockModuleOptions

Module options interface: extends the [Redlock `Settings`](https://www.npmjs.com/package/redlock) object
(`retryCount`, `retryDelay`, `retryJitter`, `driftFactor`, `automaticExtensionThreshold`) with:

-   `defaultExpireMs` - default lock expiration time in milliseconds

```typescript
import type { NestJSRxJSLockModuleOptions } from '@rnw-community/nestjs-rxjs-lock';

const lockOptions: Partial<NestJSRxJSLockModuleOptions> = { retryCount: 3, defaultExpireMs: 5000 };
```

### defaultNestJSRxJSLockModuleOptions

Default `NestJSRxJSLockModuleOptions` values applied by `registerTypedAsync`: `defaultExpireMs: 10000`, `retryCount: 0`,
`driftFactor: 0.01`, `retryDelay: 200`, `retryJitter: 200`, `automaticExtensionThreshold: 500`.

```typescript
import { NestJSRxJSLockModule, defaultNestJSRxJSLockModuleOptions } from '@rnw-community/nestjs-rxjs-lock';

const [LockModule, LockService] = NestJSRxJSLockModule.registerTypedAsync({
    retryCount: defaultNestJSRxJSLockModuleOptions.retryCount + 3,
});
```

### NestJSRxJSLockService.lock$

#### Arguments

-   `name` - unique lock identifier like user id in our setup example
-   `prefix` - typesafe `LockCodesEnum` value from the setup, used as a prefix for the lock key
-   `handler$` - business logic wrapped in RxJS observable
-   `expireInMs` - lock expiration time in milliseconds, the module `defaultExpireMs` value is used if not provided

> Redis lock key will be formed as `lock:[prefix]:[name]` and will be expired after `expireInMs` milliseconds and will
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
