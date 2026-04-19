# decorators-core

Framework-agnostic interceptor primitive for building method decorators (log, metrics, lock, retry, ...). Native Promise support built-in; opt-in RxJS Observable support via `observableStrategy`. Dual ESM + CJS. Targets TypeScript's `experimentalDecorators` mode.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core.svg)](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fdecorators-core.svg)](https://www.npmjs.com/package/%40rnw-community%2Fdecorators-core)

## Main exports

| Export | Description |
|--------|-------------|
| `createInterceptor` | Factory for `experimentalDecorators` method decorators |
| `promiseStrategy` | Built-in `ResultStrategyInterface` that handles Promise / thenable returns |
| `observableStrategy` | Built-in `ResultStrategyInterface` for RxJS `Observable` returns (value-oriented) |
| `ExecutionContextInterface` | Per-invocation context passed to every hook |
| `InterceptorInterface` | `onEnter`, `onSuccess`, `onError` hook contract |
| `ResultStrategyInterface` | Strategy contract for custom return-type handling |
| `MethodDecoratorType` | The method decorator type returned by `createInterceptor` |

## Usage

```ts
import { createInterceptor, promiseStrategy } from '@rnw-community/decorators-core';
import type { InterceptorInterface } from '@rnw-community/decorators-core';

const logInterceptor: InterceptorInterface = {
    onEnter: ({ className, methodName, args }) => console.log(`[enter] ${className}.${methodName}`, args),
    onSuccess: ({ className, methodName }, result, durationMs) => console.log(`[ok] ${className}.${methodName} (${durationMs.toFixed(2)}ms)`, result),
    onError: ({ className, methodName }, error, durationMs) => console.error(`[error] ${className}.${methodName} (${durationMs.toFixed(2)}ms)`, error),
};

const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [promiseStrategy] });

class UserService {
    @withLog
    async getUser(id: string): Promise<{ id: string }> {
        return { id };
    }
}
```

## Observable support — `observableStrategy`

Pass `observableStrategy` in `strategies` when your methods return RxJS `Observable`. Each emitted value triggers `onSuccess`; errors trigger `onError` and are re-thrown through the stream. This is a **value-oriented** strategy suitable for per-emission logging, not for completion-latency metrics.

```ts
import { createInterceptor, observableStrategy } from '@rnw-community/decorators-core';

const withLog = createInterceptor({ interceptor: logInterceptor, strategies: [observableStrategy] });
```

## License

MIT
