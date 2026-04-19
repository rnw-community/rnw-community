# Log Decorator

Universal method decorator that adds structured pre/post/error logging hooks. Built on top of TypeScript's `experimentalDecorators` mode. Zero framework dependencies.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flog-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Flog-decorator)

## Factories

### [createLegacyLog](src/create-legacy-log/create-legacy-log.ts)

Creates a method decorator factory bound to a transport and options.

```ts
import { createLegacyLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLegacyLog({ transport: consoleTransport });

class OrderService {
    @Log<[string], { id: string }>(
        orderId => `placing order ${orderId}`,
        (result, orderId) => `order ${orderId} placed: ${result.id}`,
        (error, orderId) => `order ${orderId} failed: ${String(error)}`
    )
    placeOrder(orderId: string): { id: string } { /* ... */ }
}
```

When `preLog`/`postLog`/`errorLog` are omitted, the decorator emits nothing on that lifecycle event.

## Transport

### [consoleTransport](src/console-transport/console-transport.ts)

Built-in `LogTransportInterface` implementation that forwards to `console.log` / `console.debug` / `console.error`.

```ts
import { createLegacyLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLegacyLog({ transport: consoleTransport });
```

## Interfaces

### [LogTransportInterface](src/log-transport.interface.ts)

Implement this to plug in any logging backend (Pino, Winston, NestJS Logger, etc.).

### [CreateLogOptionsInterface](src/create-log-options.interface.ts)

Options accepted by `createLegacyLog`: `transport`, optional `strategies`.

## Types

- [`PreLogInputType`](src/pre-log-input.type.ts) — string or `(...args) => string` for the entry log.
- [`PostLogInputType`](src/post-log-input.type.ts) — string or `(result, ...args) => string` for the success log.
- [`ErrorLogInputType`](src/error-log-input.type.ts) — string or `(error, ...args) => string` for the error log.

## Observable support

Pass an `observableStrategy` from `@rnw-community/decorators-core/rxjs` via the `strategies` option to handle RxJS Observable return values:

```ts
import { createLegacyLog, consoleTransport } from '@rnw-community/log-decorator';
import { observableStrategy } from '@rnw-community/decorators-core/rxjs';

const Log = createLegacyLog({ transport: consoleTransport, strategies: [observableStrategy] });
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
