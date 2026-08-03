# Log Decorator

Universal method decorator with pre / post / error logging hooks and a pluggable transport. Built on [`@rnw-community/decorators-core`](https://github.com/rnw-community/rnw-community/tree/master/packages/decorators-core). Handles sync, `Promise`, and `Observable` return types automatically. TypeScript `experimentalDecorators`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=log-decorator&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flog-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Flog-decorator)

## When each hook fires

| Return | `preLog` | `postLog` | `errorLog` |
|---|---|---|---|
| `T` (sync) | before call | after return | on sync throw |
| `Promise<T>` | before call | on resolve | on reject |
| `Observable<T>` | before call | on each emission | on stream error |

The decorator is intentionally timing-free. For duration / latency / histogram metrics, use `@rnw-community/histogram-metric-decorator` — the two decorators compose via stacking (`@HistogramMetric() @Log(...) method(...)`) with no overlap of concerns.

## Type narrowing — no factory generics needed

Callback parameter types flow from the decorated method's signature through the factory's `<K extends AnyFn, TArgs extends Parameters<K>, TResult extends GetResultType<ReturnType<K>>>` generic shape. In simple cases — sync or Promise-returning methods with typed arguments — the callback params narrow automatically. Under `experimentalDecorators` TypeScript occasionally fails to back-flow the method signature into unannotated callback params (the generic binds at the decoration site, not at the factory call); when you see callback params typed as `unknown` or `any`, annotate the callback params directly. Never spell out factory generics.

```ts
import { createLogDecorator, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLogDecorator({ transport: consoleTransport });

class OrderService {
    @Log(
        orderId => `placing order ${orderId}`,
        (result, orderId) => `order ${orderId} placed: ${result.id}`,
        (error, orderId) => `order ${orderId} failed: ${String(error)}`
    )
    placeOrder(orderId: string): { id: string } {
        return { id: `ord-${orderId}` };
    }
}
```

`orderId` narrows to `string`, `result` to `{ id: string }`, `error` is `unknown`. `Promise<T>` and `Observable<T>` return types unwrap automatically — `TResult` is the awaited or emitted value.

Omit any hook to skip that lifecycle event. Hook results that are empty strings (static `''` or a callback returning `''`) are skipped too — handy for conditional messages.

## Public API

### `createLogDecorator`

Factory; takes `{ transport }: CreateLogOptionsInterface` and returns the `@Log(preLog?, postLog?, errorLog?)` decorator factory used in the examples above.

```ts
import { createLogDecorator, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLogDecorator({ transport: consoleTransport });
```

### `consoleTransport`

Default `LogTransportInterface` forwarding to `console.log` / `console.debug` / `console.error`.

```ts
import { consoleTransport } from '@rnw-community/log-decorator';

consoleTransport.log('placing order 1', 'OrderService::placeOrder');
```

### `LogTransportInterface`

Three methods (`log`, `debug`, `error`); implement it to plug in Pino, Winston, NestJS `Logger`, or anything else.

```ts
import type { LogTransportInterface } from '@rnw-community/log-decorator';

declare const logger: {
    info: (meta: Readonly<Record<string, unknown>>, message: string) => void;
    debug: (meta: Readonly<Record<string, unknown>>, message: string) => void;
    error: (meta: Readonly<Record<string, unknown>>, message: string) => void;
};

const pinoTransport: LogTransportInterface = {
    log: (message, logContext) => logger.info({ logContext }, message),
    debug: (message, logContext) => logger.debug({ logContext }, message),
    error: (message, error, logContext) => logger.error({ logContext, error }, message),
};
```

### `CreateLogOptionsInterface`

`{ transport: LogTransportInterface }` — the sole argument to `createLogDecorator`.

```ts
import { createLogDecorator } from '@rnw-community/log-decorator';

import type { CreateLogOptionsInterface, LogTransportInterface } from '@rnw-community/log-decorator';

declare const transport: LogTransportInterface;

const options: CreateLogOptionsInterface = { transport };
const Log = createLogDecorator(options);
```

### `PreLogInputType<TArgs>`

`string | ((...args: TArgs) => string)` — the shape accepted by `@Log`'s first (`preLog`) hook.

```ts
import type { PreLogInputType } from '@rnw-community/log-decorator';

const preLog: PreLogInputType<[orderId: string]> = orderId => `placing order ${orderId}`;
```

### `PostLogInputType<TArgs, TResult>`

`string | ((result: TResult, ...args: TArgs) => string)` — the shape accepted by `@Log`'s second (`postLog`) hook.

```ts
import type { PostLogInputType } from '@rnw-community/log-decorator';

const postLog: PostLogInputType<[orderId: string], { id: string }> = (result, orderId) =>
    `order ${orderId} placed: ${result.id}`;
```

### `ErrorLogInputType<TArgs>`

`string | ((error: unknown, ...args: TArgs) => string)` — the shape accepted by `@Log`'s third (`errorLog`) hook.

```ts
import type { ErrorLogInputType } from '@rnw-community/log-decorator';

const errorLog: ErrorLogInputType<[orderId: string]> = (error, orderId) => `order ${orderId} failed: ${String(error)}`;
```

### `GetResultType<T>`

Unwraps `Promise<U>` / `Observable<U>` → `U` (passes any other `T` through unchanged). Used by the factory's generic constraint and re-exported so consumer-bound factories (for example `nestjs-enterprise`'s `Log`) stay portable under legacy CJS module resolution.

```ts
import type { GetResultType } from '@rnw-community/log-decorator';

type Unwrapped = GetResultType<Promise<{ id: string }>>; // { id: string }
```

## Observable support

Observable returns are handled internally — no opt-in, no strategy wiring. `rxjs` is an optional peer; install it only when your methods return `Observable`.

```ts
import { createLogDecorator, consoleTransport } from '@rnw-community/log-decorator';

import type { Observable } from 'rxjs';

const Log = createLogDecorator({ transport: consoleTransport });

class StreamService {
    @Log(
        symbol => `subscribing to ${symbol}`,
        (tick, symbol) => `${symbol} tick: ${tick}`,
        (error, symbol) => `${symbol} stream errored: ${String(error)}`
    )
    subscribe$(symbol: string): Observable<number> { /* ... */ }
}
```

## License

[MIT](./LICENSE.md)
