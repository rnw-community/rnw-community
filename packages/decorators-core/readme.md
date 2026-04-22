# decorators-core

Framework-agnostic middleware primitive for building method decorators (log, metrics, lock, retry, …). Zero runtime dependencies. TypeScript `experimentalDecorators`. Dual ESM + CJS.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core.svg)](https://badge.fury.io/js/%40rnw-community%2Fdecorators-core)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Fdecorators-core.svg)](https://www.npmjs.com/package/%40rnw-community%2Fdecorators-core)

## The primitive

`createInterceptor({ middleware })` wraps a method descriptor with a single middleware function:

```ts
type InterceptorMiddleware<TArgs, TResult> = (
    context: ExecutionContextInterface<TArgs>,
    next: () => TResult
) => TResult;
```

`next()` invokes the original method. The middleware decides what to do before, after, around, or instead of that call — observe timings, retry, short-circuit, log, acquire a lock — and returns whatever shape the method returns (sync value, `Promise<T>`, `Observable<T>`, or anything else). The engine is transport-agnostic and result-shape-agnostic; the middleware owns both.

Stack multiple concerns by stacking decorators at the call site, not by composing internal arrays:

```ts
class OrderService {
    @Log(...)
    @HistogramMetric(...)
    @SequentialLock(...)
    async placeOrder(id: string): Promise<Receipt> { /* ... */ }
}
```

## Exports

| Export | Purpose |
|---|---|
| `createInterceptor` | Method-decorator factory; takes `{ middleware }`, returns a `MethodDecoratorType<AnyFn>` |
| `InterceptorMiddleware<TArgs, TResult>` | Function type: `(context, next) => TResult` |
| `ExecutionContextInterface<TArgs>` | `{ className, methodName, args, logContext }` — stable identity per invocation |
| `CreateInterceptorOptionsInterface<TArgs, TResult>` | `{ middleware }` — the sole option |

`MethodDecoratorType<K>` comes from [`@rnw-community/shared`](../shared) — import it directly, not through this package.

## Build your own decorator

```ts
import { createInterceptor } from '@rnw-community/decorators-core';

import type { InterceptorMiddleware } from '@rnw-community/decorators-core';

const logMiddleware: InterceptorMiddleware = (context, next) => {
    const start = performance.now();
    console.log(`[enter] ${context.logContext}`, context.args);
    try {
        const result = next();
        console.log(`[ok] ${context.logContext} (${(performance.now() - start).toFixed(2)}ms)`, result);

        return result;
    } catch (error) {
        console.error(`[err] ${context.logContext} (${(performance.now() - start).toFixed(2)}ms)`, error);
        throw error;
    }
};

const withLog = createInterceptor({ middleware: logMiddleware });

class UserService {
    @withLog
    getUser(id: string): { id: string } { return { id }; }
}
```

For `Promise` or `Observable` return types the middleware attaches callbacks to the settled/completion signal — the engine does not special-case them. See `@rnw-community/log-decorator`, `@rnw-community/histogram-metric-decorator`, and `@rnw-community/lock-decorator` for working Promise- and Observable-aware middleware implementations.

## Execution context

`buildContext(this, fallbackClassName, methodName, args)` produces one `ExecutionContextInterface` per invocation:

- `className` — resolved from `this.constructor.name` when `this` is a class instance, from `this.name` when the method is static (so `this` is the class constructor), and falls back to the target's name at decoration time when `this` is detached or `globalThis`. Anonymous classes fall back to `'Object'`.
- `methodName` — the property key as a string.
- `args` — the original method arguments (tuple-typed via `TArgs`).
- `logContext` — convenience format `` `${className}::${methodName}` `` for consumer transports.

The context identity is stable across a single invocation — middleware can capture `context` in closures (timers, resource handles) without worrying about mutation.

## Engine guarantees

- Non-function descriptors (getters, setters, value properties) pass through unchanged — the engine returns the input descriptor.
- The middleware is called exactly once per decorated-method invocation.
- `next()` is called exactly once inside the middleware unless the middleware short-circuits (and MUST NOT be called more than once; the engine does not re-enter).
- The engine does not catch middleware-thrown errors — they propagate to the caller unchanged. Wrap in `try/catch` inside the middleware if you need to transform or observe failures.

## License

[MIT](../../LICENSE.md)
