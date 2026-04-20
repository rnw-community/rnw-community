# Log Decorator

Universal method decorator that adds structured pre/post/error logging hooks. Built on top of TypeScript's `experimentalDecorators` mode. Zero framework dependencies.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flog-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Flog-decorator)

## Factories

### [createLog](src/create-log/create-log.ts)

Creates a method decorator factory bound to a transport and options.

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLog({ transport: consoleTransport });

class OrderService {
    @Log(
        (orderId: string) => `placing order ${orderId}`,
        (result, orderId) => `order ${orderId} placed: ${result.id}`,
        (error, orderId) => `order ${orderId} failed: ${String(error)}`
    )
    placeOrder(orderId: string): { id: string } {
        /* ... */
    }
}
```

If TypeScript loses callback context under legacy `experimentalDecorators`, annotate the callback parameters directly. Do not add decorator generics.

When `preLog`/`postLog`/`errorLog` are omitted, the decorator emits nothing on that lifecycle event.

## Transport

### [consoleTransport](src/console-transport/console-transport.ts)

Built-in `LogTransportInterface` implementation that forwards to `console.log` / `console.debug` / `console.error`.

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLog({ transport: consoleTransport });
```

## Interfaces

### [LogTransportInterface](src/interface/log-transport.interface.ts)

Implement this to plug in any logging backend (Pino, Winston, NestJS Logger, etc.).

### [CreateLogOptionsInterface](src/interface/create-log-options.interface.ts)

Options accepted by `createLog`: `transport`, optional `strategies`.

## Types

- [`PreLogInputType`](src/type/pre-log-input.type.ts) — string or `(...args) => string` for the entry log.
- [`PostLogInputType`](src/type/post-log-input.type.ts) — string or `(result, ...args) => string` for the success log.
- [`ErrorLogInputType`](src/type/error-log-input.type.ts) — string or `(error, ...args) => string` for the error log.

## Observable support

Pass `observableStrategy` from `@rnw-community/decorators-core` via the `strategies` option to handle RxJS Observable return values:

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';
import { observableStrategy } from '@rnw-community/decorators-core';

const Log = createLog({ transport: consoleTransport, strategies: [observableStrategy] });
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
