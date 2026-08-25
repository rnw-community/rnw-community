# @rnw-community/nestjs-rxjs-lock

NestJS module for distributed locking via Redis (ioredis) and Redlock, with an RxJS Observable API.

## Package Commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm lint:fix
```

## Architecture

```text
src/
  index.ts                                 — barrel: options, module, service
  nestjs-rxjs-lock-module.options.ts       — NestJSRxJSLockModuleOptions (extends redlock's Settings + defaultExpireMs);
                                              defaultNestJSRxJSLockModuleOptions (defaultExpireMs: 10000, retryCount: 0,
                                              driftFactor: 0.01, retryDelay: 200, retryJitter: 200,
                                              automaticExtensionThreshold: 500)
  nestjs-rxjs-lock-module/
    nestjs-rxjs-lock.module.ts             — NestJSRxJSLockModule.registerTypedAsync<E>()
  nestjs-rxjs-lock-service/
    nestjs-rxjs-lock.service.ts            — NestJSRxJSLockService<E> abstract base class
```

### Key Patterns

- `NestJSRxJSLockModule.registerTypedAsync<E = string>(options?)` declares an anonymous `@Injectable()` `LockService
extends NestJSRxJSLockService<E>` inline, merges `{ ...defaultNestJSRxJSLockModuleOptions, ...options }` in its
  constructor, and returns `[DynamicModule, Type<NestJSRxJSLockService<E>>]` (imports `RedisModule` from
  `@nestjs-modules/ioredis`) — the same tuple pattern used by the other NestJS packages in this repo
- `NestJSRxJSLockService` constructor splits `options` into `{ defaultExpireMs, ...redlockOptions }`: `defaultExpireMs`
  becomes the per-instance default lock TTL, `redlockOptions` is passed straight into `new Redlock([redis], ...)`
- `lock$<T>(name, prefix, handler$, expireInMs = this.expireInMs)`: `from(this.lock.acquire([lockName], expireInMs))`
  piped through `concatMap(lock => handler$().pipe(finalize(() => void lock.release().catch(() => void 0))))` — the
  handler only runs after acquisition succeeds, and release is always attempted on completion/error/unsubscribe
  because `finalize` runs regardless of how the inner observable terminates — release is only attempted, not
  guaranteed: if Redis rejects the release call, the swallowed error (see below) means the lock stays held until
  its TTL expires rather than being freed immediately
- Lock key is built by the private static `generateName(name, prefix)`: `['lock', prefix, name].filter(isNotEmptyString).join(':')`
  — a falsy/empty `prefix` collapses to `lock:name` instead of `lock::name`
- An error thrown while **acquiring** the lock propagates to the subscriber and neither `handler$` nor `release` ever run
  (nothing was acquired to release)
- An error thrown by `lock.release()` is swallowed by `.catch(() => void 0)` inside `finalize` — it never reaches the
  subscriber, so a Redis hiccup during release cannot fail an otherwise-successful `handler$` result
- Default `retryCount: 0` — lock acquisition is non-blocking/exclusive: a contended lock rejects immediately instead of
  retrying

### Dependencies

`@nestjs-modules/ioredis`, `@nestjs/common`, `@nestjs/core`, `@rnw-community/shared` (`isNotEmptyString`), `ioredis`,
`redlock` (patched via pnpm — `redlock@npm:5.0.0-beta2` with a local patch), `rxjs`. No `peerDependencies` — all of these
ship as direct `dependencies`.

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — no package-level
`coverageThreshold` override in `jest.config.js`.
