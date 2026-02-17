# @rnw-community/nestjs-rxjs-lock

NestJS module for distributed locking via Redis (ioredis) and Redlock, with an RxJS Observable API.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  nestjs-rxjs-lock-module.options.ts  — NestJSRxJSLockModuleOptions (extends Redlock Settings + defaultExpireMs)
  nestjs-rxjs-lock-module/            — NestJSRxJSLockModule with registerTypedAsync<E>() factory
  nestjs-rxjs-lock-service/           — NestJSRxJSLockService<E> abstract base class
```

### Key Patterns

- `registerTypedAsync<E>()` returns `[DynamicModule, Type<NestJSRxJSLockService<E>>]` — generic enum `E` constrains lock key prefixes
- `lock$(name, prefix, handler$, expireMs)` → `Observable<T>`: acquires lock, runs handler in `concatMap`, releases in `finalize`
- Lock key format: `lock:[prefix]:[name]`
- Release errors are silently swallowed — never pollute the subscriber stream
- Default `retryCount: 0` (non-blocking/exclusive)

### Dependencies

`@nestjs-modules/ioredis`, `@nestjs/common`, `@nestjs/core`, `@rnw-community/shared`, `ioredis`, `redlock`, `rxjs`

### Coverage

Default: **99.9%** all metrics.
