# @rnw-community/nestjs-rxjs-redis

RxJS-wrapped Redis operations for NestJS. Observable-returning methods (`$` suffix) and higher-order pipeable operators (`save`, `load`, `remove`, `cache`).

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  index.ts                            — barrel: service, module (named exports, not `export *`)
  nestjs-rxjs-redis-core.module.ts    — @Global() NestJSRxJSRedisCoreModule.forRootAsync(options)
  nestjs-rxjs-redis.module.ts         — NestJSRxJSRedisModule.forRootAsync(options) (thin wrapper over CoreModule)
  nestjs-rxjs-redis-service/
    nestjs-rxjs-redis.service.ts      — NestJSRxJSRedisService (@Injectable)
```

### Key Patterns

- Two-module architecture: `NestJSRxJSRedisCoreModule` (`@Global()`, declares `NestJSRxJSRedisService` as a provider,
  its static `forRootAsync` imports `RedisModule.forRootAsync(options)`) + `NestJSRxJSRedisModule` (the consumer-facing
  module whose `forRootAsync` just imports `NestJSRxJSRedisCoreModule.forRootAsync(options)`) — consumers only ever
  import the public module, the core module only exists to make the service globally injectable exactly once
- Observable methods end in `$`: `set$(key, value, ttlInSeconds, error?)`, `get$(key, error?)`, `del$(key, error?)`,
  `ttl$(key, error?)`, `expire$(key, seconds, error?)`, `incr$(key, error?)`, `mget$(keys)`
- `set$`, `del$`, `ttl$`, `expire$`, `incr$` and `get$` all wrap the underlying Redis promise with
  `catchError(() => throwError(() => new Error(error)))` — a rejected/erroring Redis call always surfaces as a plain
  `Error` with the caller-supplied (or default, key-interpolated) message; **`mget$` is the one exception** — it has no
  `catchError` and lets a rejected `mget` promise propagate unmodified
- `get$` additionally treats a resolved `null` (key not found) as an error via `concatMap` before its `catchError`
  runs — both "not found" and "Redis threw" surface identically as `Error(error)`; use `mget$` when a `null` value per
  key must be observable instead of thrown
- `mget$<K extends string>(keys)` zips the resolved value array back onto the input `keys` via `reduce`, returning
  `Record<K, string | null>` — the only method that turns a positional array result into a keyed object
- Operator methods (`save`, `load`, `remove`, `cache`) are pipeable `MonoTypeOperatorFunction`/`OperatorFunction`s that
  wrap the `$` methods; `load`, `remove`, and `cache` default their `keyFn`/`errorFn`/`toValueFn`/`fromValueFn` params
  (`String(input)` for keys, `JSON.stringify`/`JSON.parse` for (de)serialization) — `save` takes `keyFn` as its first,
  required parameter (no default), since the caller must say how to derive a Redis key from the value being saved
- `cache(ttlInSeconds, prepareFn$, keyFn?, fromValueFn?, toValueFn?)`: on each input, tries `get$(key)` + `fromValueFn`
  first; if that observable errors (cache miss or Redis error, indistinguishable), falls back to
  `prepareFn$(key)` and pipes its result into `set$` before re-emitting the freshly prepared value — a cache miss and
  a Redis outage take the same fallback path

### Dependencies

Peers: `@nestjs-modules/ioredis`, `@nestjs/common`, `ioredis`, `rxjs` (all declared in both `devDependencies` and
`peerDependencies`). Direct dependency: `@rnw-community/shared` (`isDefined`, used in production `src` for the `get$`
null check).

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — no package-level
`coverageThreshold` override in `jest.config.js`.
