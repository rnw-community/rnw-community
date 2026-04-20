# decorators-core

Framework-agnostic interceptor primitive for building method decorators (log, metrics, lock, retry, …). TypeScript `experimentalDecorators`. Dual ESM + CJS. `rxjs` is an optional peer — required only when importing `observableStrategy`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core.svg)](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fdecorators-core.svg)](https://www.npmjs.com/package/%40rnw-community%2Fdecorators-core)

## Exports

| Export | Purpose |
|---|---|
| `createInterceptor` | Build a method decorator from an `InterceptorInterface` + optional strategies |
| `promiseStrategy` | Built-in result strategy for thenables (Promise / Promise-like) |
| `observableStrategy` | Built-in result strategy for RxJS `Observable` (per-emission, value-oriented) |
| `InterceptorInterface` | `onEnter`, `onSuccess`, `onError` hook contract |
| `ResultStrategyInterface` | `{ matches, handle }` for custom return-type handling |
| `ExecutionContextInterface` | Per-invocation context: `className`, `methodName`, `args`, `logContext` |
| `CreateInterceptorOptionsInterface` | `{ interceptor, strategies? }` factory input |
| `GetResultType<T>` | Unwrap helper: `Promise<U>` / `Observable<U>` → `U`; otherwise `T` |

Method decorator shape comes from [`@rnw-community/shared`](../shared)'s `MethodDecoratorType<K>` — import it directly, not through this package.

## Build your own decorator

```ts
import { createInterceptor, promiseStrategy } from '@rnw-community/decorators-core';
import type { InterceptorInterface } from '@rnw-community/decorators-core';

const logInterceptor: InterceptorInterface = {
    onEnter: ({ logContext, args }) => console.log(`[enter] ${logContext}`, args),
    onSuccess: ({ logContext }, result, durationMs) => console.log(`[ok] ${logContext} (${durationMs.toFixed(2)}ms)`, result),
    onError: ({ logContext }, error, durationMs) => console.error(`[err] ${logContext} (${durationMs.toFixed(2)}ms)`, error),
};

const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [promiseStrategy] });

class UserService {
    @withLog
    async getUser(id: string): Promise<{ id: string }> { return { id }; }
}
```

## Observable support

```ts
import { createInterceptor, observableStrategy } from '@rnw-community/decorators-core';

const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [observableStrategy] });
```

`observableStrategy` is **value-oriented**: `onSuccess` fires per emission, `onError` on stream error. It is NOT completion-latency — use a dedicated `finalize()` for that.

## Engine guarantees

- `onSuccess` receives `Awaited<TResult>` (the resolved value, not the Promise)
- Per-invocation `ExecutionContext` identity is stable across `onEnter`/`onSuccess`/`onError`
- Hook errors are swallowed — transport failures never poison the decorated method
- Promise/thenable handling is built-in; Observable requires the opt-in strategy

## License

MIT
