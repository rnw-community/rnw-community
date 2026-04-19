# decorators-core

Framework-agnostic interceptor primitive for building method decorators (log, metrics, lock, retry, ...). Native Promise support built-in; opt-in RxJS Observable support via the `/rxjs` subpath. Dual ESM + CJS. Supports both TC39 stage-3 decorators and legacy `experimentalDecorators`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core.svg)](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fdecorators-core.svg)](https://www.npmjs.com/package/%40rnw-community%2Fdecorators-core)

## Main exports

| Export | Description |
|--------|-------------|
| `createInterceptor` | Factory for TC39 stage-3 method decorators |
| `createLegacyInterceptor` | Factory for legacy (`experimentalDecorators`) method decorators |
| `promiseStrategy` | Built-in `ResultStrategyInterface` that handles Promise / thenable returns |
| `ExecutionContextInterface` | Per-invocation context passed to every hook |
| `InterceptorInterface` | `onEnter`, `onSuccess`, `onError` hook contract |
| `ResultStrategyInterface` | Strategy contract for custom return-type handling |
| `now` | High-resolution timestamp helper (`performance.now()`) |

## Usage

```ts
import { createInterceptor, createLegacyInterceptor, promiseStrategy } from '@rnw-community/decorators-core';
import type { InterceptorInterface } from '@rnw-community/decorators-core';

const logInterceptor: InterceptorInterface = {
    onEnter: ({ logContext, args }) => console.log(`[enter] ${logContext}`, args),
    onSuccess: ({ logContext }, result, durationMs) => console.log(`[ok] ${logContext} (${durationMs.toFixed(2)}ms)`, result),
    onError: ({ logContext }, error, durationMs) => console.error(`[error] ${logContext} (${durationMs.toFixed(2)}ms)`, error),
};

const withLog = createLegacyInterceptor({ interceptor: logInterceptor, strategies: [promiseStrategy] });

class UserService {
    @withLog
    async getUser(id: string): Promise<{ id: string }> {
        return { id };
    }
}
```

For TC39 stage-3 decorators (`"experimentalDecorators": false`):

```ts
const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [promiseStrategy] });

class UserService {
    @withLog
    async getUser(id: string): Promise<{ id: string }> {
        return { id };
    }
}
```

## `/rxjs` subpath — `observableStrategy`

Pass `observableStrategy` in `strategies` when your methods return RxJS `Observable`. Each emitted value triggers `onSuccess`; errors trigger `onError` and are re-thrown through the stream.

```ts
import { createLegacyInterceptor } from '@rnw-community/decorators-core';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

const withLog = createLegacyInterceptor({ interceptor: logInterceptor, strategies: [observableStrategy] });
```

## License

MIT
