# @rnw-community/nestjs-rxjs-logger

RxJS-native logging operators for NestJS. Provides pipeable operators (`debug$`, `info$`, `warn$`, `error$`, `verbose$`) that log side-effects inside Observable streams.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  enum/                         — AppLogLevelEnum (debug, error, info, verbose, warn)
  nestjs-rxjs-logger-module/    — NestJSRxJSLoggerModule (static, provides Logger as 'LOGGER' token)
  nestjs-rxjs-logger-service/   — NestJSRxJSLoggerService (TRANSIENT scope)
```

### Key Patterns

- Service is `TRANSIENT`-scoped — each consumer gets its own instance with its own context
- All log methods return `MonoTypeOperatorFunction<T>` — pass-through the stream value while logging
- Message can be a string or `(input: T) => string` function receiving the stream value
- `.catch(errorMsgFn)` catches errors, logs, and re-throws
- `.create$(message)` creates an `Observable<boolean>` that emits `true` and logs
- Internal `print$` uses `concatMap` pattern for side-effect logging

### Dependencies

Peers: `@nestjs/common`, `rxjs`. Internal: `@rnw-community/shared`.

### Coverage

Default: **99.9%** all metrics.
