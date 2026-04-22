# Log Decorator

Universal method decorator with pre / post / error logging hooks and a pluggable transport. Built on [`@rnw-community/decorators-core`](../decorators-core). Handles sync, `Promise`, and `Observable` return types automatically. TypeScript `experimentalDecorators`.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
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

- [`createLogDecorator`](src/create-log-decorator/create-log-decorator.ts) — factory; takes `{ transport }` and returns the `@Log(preLog?, postLog?, errorLog?)` decorator factory
- [`consoleTransport`](src/console-transport/console-transport.ts) — default `LogTransportInterface` forwarding to `console.log` / `console.debug` / `console.error`
- [`LogTransportInterface`](src/interface/log-transport.interface.ts) — three methods (`log`, `debug`, `error`); plug in Pino, Winston, NestJS `Logger`, anything
- [`CreateLogOptionsInterface`](src/interface/create-log-options.interface.ts) — `{ transport }`
- [`PreLogInputType`](src/type/pre-log-input.type.ts) / [`PostLogInputType`](src/type/post-log-input.type.ts) / [`ErrorLogInputType`](src/type/error-log-input.type.ts) — string or spread-args function
- [`GetResultType<T>`](src/type/get-result.type.ts) — unwraps `Promise<U>` / `Observable<U>` → `U`; used by the factory's generic constraint and re-exported so consumer-bound factories (for example `nestjs-enterprise`'s `Log`) stay portable under legacy CJS module resolution

## Observable support

Observable returns are handled internally — no opt-in, no strategy wiring. `rxjs` is an optional peer; install it only when your methods return `Observable`.

```ts
import { createLogDecorator, consoleTransport } from '@rnw-community/log-decorator';

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
