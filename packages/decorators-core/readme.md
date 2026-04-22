# decorators-core

Framework-agnostic interceptor primitive for building method decorators (log, metrics, lock, retry, …). TypeScript `experimentalDecorators`. Dual ESM + CJS. `rxjs` is an optional peer — required only when importing `observableStrategy` / `completionObservableStrategy`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core.svg)](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fdecorators-core.svg)](https://www.npmjs.com/package/%40rnw-community%2Fdecorators-core)

## Exports

| Export | Purpose |
|---|---|
| `createInterceptor` | Build a method decorator from an `InterceptorInterface` + optional strategies |
| `syncStrategy` | Catch-all strategy (`matches: () => true`) — auto-appended as terminal fallback |
| `promiseStrategy` | Built-in result strategy for Promises / thenables — auto-appended after user strategies |
| `observableStrategy` | RxJS `Observable` strategy (per-emission) — imported from `@rnw-community/decorators-core/rxjs` |
| `completionObservableStrategy` | RxJS `Observable` strategy (completion-latency) — imported from `@rnw-community/decorators-core/rxjs` |
| `InterceptorInterface` | `onEnter`, `onSuccess`, `onError` hook contract |
| `ResultStrategyInterface` | `{ matches, handle }` for custom return-type handling |
| `ExecutionContextInterface` | Per-invocation context: `className`, `methodName`, `args`, `logContext` |
| `CreateInterceptorOptionsInterface` | `{ interceptor, strategies? }` factory input |

Method decorator shape comes from [`@rnw-community/shared`](../shared)'s `MethodDecoratorType<K>` — import it directly, not through this package.

## The engine is a strategy coordinator

`createInterceptor` composes a dispatch chain from user-supplied strategies plus two auto-appended built-ins:

```
[...userStrategies, promiseStrategy, syncStrategy]
```

On every decorated-method invocation the engine finds the first strategy whose `matches` returns true and delegates to its `handle`. `syncStrategy.matches` returns `true` unconditionally, guaranteeing total coverage.

**Consumers rarely need to pass strategies explicitly.** Pass only when adding Observable support or composing custom behavior.

## Build your own decorator

```ts
import { createInterceptor } from '@rnw-community/decorators-core';
import type { InterceptorInterface } from '@rnw-community/decorators-core';

const logInterceptor: InterceptorInterface = {
    onEnter: ({ logContext, args }) => console.log(`[enter] ${logContext}`, args),
    onSuccess: ({ logContext }, result, durationMs) => console.log(`[ok] ${logContext} (${durationMs.toFixed(2)}ms)`, result),
    onError: ({ logContext }, error, durationMs) => console.error(`[err] ${logContext} (${durationMs.toFixed(2)}ms)`, error),
};

const withLog = createInterceptor({ interceptor: logInterceptor });

class UserService {
    @withLog
    async getUser(id: string): Promise<{ id: string }> { return { id }; }
}
```

`withLog` handles sync returns, `Promise<T>` returns, and anything else the built-in strategies cover. No explicit strategy wiring required.

## Observable support

Observable strategies live under the `/rxjs` subpath so the root entrypoint stays rxjs-free. Sync-only consumers can install and run `@rnw-community/decorators-core` without `rxjs` in their tree.

```ts
import { createInterceptor } from '@rnw-community/decorators-core';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [observableStrategy] });
```

`observableStrategy` is **value-oriented**: `onSuccess` fires per emission, `onError` on stream error. It is NOT completion-latency — use `completionObservableStrategy` for that (fires once on `complete` with the last emitted value, or once on stream error).

**Do not wire both** `observableStrategy` and `completionObservableStrategy` in the same factory — they both match `isObservable`, and whichever appears first in the strategies array silently wins. They are mutually exclusive by intent.

## `syncStrategy` placement

Auto-appended by `createInterceptor` as the terminal strategy. You rarely need to import it. If you're composing a strategy array manually, place it LAST:

```ts
// ✓ DO: auto-append handles it
createInterceptor({ interceptor, strategies: [observableStrategy] });

// ✗ DON'T: placing syncStrategy first breaks Promise/Observable handling
createInterceptor({ interceptor, strategies: [syncStrategy, promiseStrategy] });
//                                              ^^^^^^^^^^^^ matches everything; Promise returns never reach promiseStrategy
```

## Engine guarantees

- `onSuccess` receives `Awaited<TResult>` (the resolved value, not the Promise)
- Per-invocation `ExecutionContext` identity is stable across `onEnter` / `onSuccess` / `onError`
- Hook errors are swallowed — transport failures never poison the decorated method
- Promise and sync handling are auto-wired; Observable requires opting into `observableStrategy` or `completionObservableStrategy`
- `ResultStrategyInterface.handle` MUST NOT throw synchronously; if it does, the exception propagates unguarded — the caller sees the raw throw, `onError` does not fire

## License

MIT
