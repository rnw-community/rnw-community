# Log Decorator

Universal method decorator with pre/post/error logging hooks and a pluggable transport. Built on TypeScript's `experimentalDecorators`. Zero framework dependencies.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flog-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Flog-decorator)

## Type narrowing — no generics

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

`orderId` is `string`, `result` is `{ id: string }`, `error` is `unknown`. Promise/Observable return types unwrap automatically (`TResult` is the awaited or emitted value).

Omit any hook to skip that lifecycle event. Empty-string hook results (static `''` or callback returning `''`) are skipped too.

## Public API

- [`createLogDecorator`](src/create-log-decorator/create-log-decorator.ts) — decorator factory; returns `<K extends AnyFn>(...) => MethodDecoratorType<K>`
- [`consoleTransport`](src/console-transport/console-transport.ts) — default `LogTransportInterface` forwarding to `console.log`/`debug`/`error`
- [`LogTransportInterface`](src/interface/log-transport.interface.ts) — plug in Pino, Winston, Nest `Logger`, anything
- [`CreateLogOptionsInterface`](src/interface/create-log-options.interface.ts) — `{ transport, strategies? }`
- [`PreLogInputType`](src/type/pre-log-input.type.ts) / [`PostLogInputType`](src/type/post-log-input.type.ts) / [`ErrorLogInputType`](src/type/error-log-input.type.ts) — string or spread-args function

## Observable support

Opt in by passing [`observableStrategy`](../decorators-core/src/strategy/observable-strategy/observable.strategy.ts) from [`@rnw-community/decorators-core`](../decorators-core):

```ts
import { createLogDecorator, consoleTransport } from '@rnw-community/log-decorator';
import { observableStrategy } from '@rnw-community/decorators-core';

const Log = createLogDecorator({ transport: consoleTransport, strategies: [observableStrategy] });
```

`postLog` then fires per emission; `errorLog` fires on stream error. `rxjs` is an optional peer — install it only when using `observableStrategy`.

## License

[MIT](./LICENSE.md)
