# @rnw-community/nestjs-rxjs-redis

RxJS-wrapped Redis operations for NestJS. Observable-returning methods (`$` suffix) and higher-order pipeable operators (`save`, `load`, `remove`, `cache`).

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  nestjs-rxjs-redis-service/    — NestJSRxJSRedisService (injectable)
  nestjs-rxjs-redis-core.module.ts — @Global() core module (wires RedisModule + service)
  nestjs-rxjs-redis.module.ts   — NestJSRxJSRedisModule with forRootAsync(options)
```

### Key Patterns

- Two-module architecture: `CoreModule` (@Global, handles DI) + `PublicModule` (consumer API)
- Observable methods end in `$`: `set$`, `get$`, `del$`, `ttl$`, `expire$`, `incr$`, `mget$`
- Operator methods: `save`, `load`, `remove`, `cache` (pipeable `OperatorFunction`s)
- `cache` operator: tries `get$` first, falls back to `prepareFn$` observable + `set$`
- `get$` throws if Redis returns null — use `mget$` for nullable multi-key lookups
- All `$` methods wrap Redis promise errors with `catchError`

### Dependencies

Peers: `@nestjs-modules/ioredis`, `@nestjs/common`, `ioredis`, `rxjs`. Internal: `@rnw-community/shared`.

### Coverage

Default: **99.9%** all metrics.
