# Log Decorator

Universal method decorator that adds structured pre/post/error logging hooks with built-in sanitization and optional duration measurement. Supports both TC39 stage-3 and legacy (`experimentalDecorators`) decorator styles. Zero framework dependencies.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Flog-decorator.svg)](https://badge.fury.io/js/%40rnw-community%2Flog-decorator)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Flog-decorator.svg)](https://www.npmjs.com/package/%40rnw-community%2Flog-decorator)

## Factories

### [createLog](src/factory/create-log/create-log.ts)

Creates a stage-3 (TC39) method decorator factory bound to a transport and options.

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLog({ transport: consoleTransport, measureDuration: true });

class UserService {
    @Log('fetching user', 'user fetched', 'fetch failed')
    getUser(id: string): User { /* ... */ }
}
```

### [createLegacyLog](src/factory/create-legacy-log/create-legacy-log.ts)

Same API as `createLog` but targets `experimentalDecorators` (TypeScript `legacy` decorator mode).

```ts
import { createLegacyLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLegacyLog({ transport: consoleTransport });

class OrderService {
    @Log(undefined, (result, args) => `order ${args[0]} placed: ${result.id}`)
    placeOrder(id: string): Order { /* ... */ }
}
```

## Transport

### [consoleTransport](src/transport/console-transport/console-transport.ts)

Built-in `LogTransportInterface` implementation that forwards to `console.log` / `console.debug` / `console.error`.

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';

const Log = createLog({ transport: consoleTransport });
```

## Utilities

### [defaultSanitizer](src/util/default-sanitizer/default-sanitizer.ts)

Default `SanitizerFnType` implementation — truncates strings > 200 chars, arrays > 20 elements, serialises `Error` / `Date` / `RegExp` / `Map` / `Set`, and guards against circular references.

```ts
import { defaultSanitizer } from '@rnw-community/log-decorator';

const safe = defaultSanitizer({ token: 'x'.repeat(300) });
// => { token: '<truncated:300>' }
```

## Interfaces

### [LogTransportInterface](src/interface/log-transport-interface/log-transport.interface.ts)

Implement this to plug in any logging backend (Pino, Winston, NestJS Logger, etc.).

### [CreateLogOptionsInterface](src/interface/create-log-options-interface/create-log-options.interface.ts)

Options accepted by `createLog` / `createLegacyLog`: `transport`, optional `sanitizer`, optional `strategies`, optional `measureDuration`.

## Types

- [`PreLogInputType`](src/type/pre-log-input-type/pre-log-input.type.ts) — string or `(args) => string` for the entry log.
- [`PostLogInputType`](src/type/post-log-input-type/post-log-input.type.ts) — string or `(result, args) => string` for the success log.
- [`ErrorLogInputType`](src/type/error-log-input-type/error-log-input.type.ts) — string or `(error, args) => string` for the error log.
- [`SanitizerFnType`](src/type/sanitizer-fn-type/sanitizer-fn.type.ts) — `(value: unknown) => unknown` contract for custom sanitizers.

## Observable support

Pass an `observableStrategy` from `@rnw-community/decorators-core/rxjs` via the `strategies` option to handle RxJS Observable return values:

```ts
import { createLog, consoleTransport } from '@rnw-community/log-decorator';
import { rxjsStrategy } from '@rnw-community/decorators-core/rxjs';

const Log = createLog({ transport: consoleTransport, strategies: [rxjsStrategy] });
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
