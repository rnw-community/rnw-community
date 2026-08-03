# @rnw-community/nestjs-rxjs-logger

RxJS-native logging operators for NestJS. Provides pipeable operators (`debug`, `info`, `warn`, `error`, `verbose`,
plus `create$` and `catch`) that log side-effects inside Observable streams.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  index.ts                         — barrel: enum, service, module
  enum/
    app-log-level.enum.ts          — AppLogLevelEnum (debug, error, info, verbose, warn)
  nestjs-rxjs-logger-module/
    nestjs-rxjs-logger.module.ts   — NestJSRxJSLoggerModule (static @Module, provides `Logger` under 'LOGGER' token)
  nestjs-rxjs-logger-service/
    nestjs-rxjs-logger.service.ts  — NestJSRxJSLoggerService (TRANSIENT scope)
```

### Key Patterns

- The five level methods (`debug`, `info`, `warn`, `error`, `verbose`) are **not** `$`-suffixed despite being RxJS
  operators — only `create$` carries the `$` convention (it starts a new stream rather than piping an existing one)
- Every level method delegates to the private `print$<T>(message, context, level)`, which returns a
  `MonoTypeOperatorFunction<T>` built from `concatMap(input => { this.print(...); return [input]; })` — the stream
  value passes through unchanged while the log side-effect runs
- `message` is either a plain `string` or `(input: T) => string` — `print$` calls the function form with the stream's
  emitted value only when `typeof message === 'function'`
- `context` defaults to `this.context` (set once via `setContext(context)`) on every method, so a service can log
  without repeating its context on each call site
- `.catch(errorMsgFn, context?)` wraps `catchError`: logs at `AppLogLevelEnum.error` via the synchronous `print()`
  (not `print$`) using the error-derived message, then re-throws the original error with `throwError(() => error)` —
  it never swallows the error
- `.create$(message, context?, level = AppLogLevelEnum.info)` builds `of(true).pipe(tap(() => this.print(...)))` — the
  only method that starts a stream from scratch rather than piping through one
- `print(message, context, level)` is a synchronous dispatcher: an `if`/`else if` chain maps `AppLogLevelEnum.debug`
  →`logger.debug`, `.error`→`logger.error`, `.warn`→`logger.warn`, `.info`→`logger.log`, and the `else` branch (only
  reachable for `.verbose`) →`logger.verbose`
- The service is `@Injectable({ scope: Scope.TRANSIENT })` — each consumer gets its own instance, so `setContext` on
  one consumer's injected instance never leaks into another's
- `NestJSRxJSLoggerModule`'s only provider wiring is `{ provide: 'LOGGER', useValue: Logger }` — it binds the **class**
  `Logger` itself (from `@nestjs/common`), not an instance created with `new Logger()`. This works because
  `@nestjs/common`'s `Logger` exposes matching static methods (`Logger.debug`, `.error`, `.warn`, `.log`, `.verbose`)
  alongside its instance API, so `this.logger.debug(...)` inside the service resolves to the static call

### Dependencies

Peers: `@nestjs/common`, `rxjs` (both `devDependencies` + `peerDependencies`, not bundled). Direct dependency:
`@rnw-community/shared` — used only by the test specs (`getErrorMessage`, `isNotEmptyString`), not by production `src`
code.

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines) — no package-level
`coverageThreshold` override in `jest.config.js`.
