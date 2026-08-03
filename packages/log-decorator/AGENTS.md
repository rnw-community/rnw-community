# @rnw-community/log-decorator

Framework-agnostic `@Log` method decorator with pluggable transport and structured pre/post/error hooks. Built on `@rnw-community/decorators-core`'s single-middleware interceptor. Targets TypeScript's `experimentalDecorators` mode.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  interface/
    create-log-options.interface.ts  — CreateLogOptionsInterface: { transport }
    log-transport.interface.ts       — LogTransportInterface: log/debug(message, logContext), error(message, error, logContext)
  type/
    pre-log-input.type.ts    — PreLogInputType<TArgs> = string | ((...args: TArgs) => string)
    post-log-input.type.ts   — PostLogInputType<TArgs, TResult> = string | ((result: TResult, ...args: TArgs) => string)
    error-log-input.type.ts  — ErrorLogInputType<TArgs> = string | ((error: unknown, ...args: TArgs) => string)
    get-result.type.ts       — GetResultType<T>: unwraps Promise<U> / Observable<U> to U
  console-transport/     — consoleTransport, the default LogTransportInterface over console.log/debug/error + spec
  create-log-decorator/  — createLogDecorator(options) factory; the middleware body (buildLogMiddleware) is inlined in this same file + spec
  index.ts
```

### Key Patterns

- `createLogDecorator({ transport })` returns a factory; calling that factory with `(preLog?, postLog?, errorLog?)` builds the actual `@Log(...)` decorator via `createInterceptor` from `@rnw-community/decorators-core`.
- There is no `observableStrategy` import from `decorators-core` (that strategy no longer exists). The single middleware branches by hand on what `next()` returns, using `isPromise` (from `@rnw-community/shared`) and `isObservable` (from `rxjs`) to pick the sync / Promise / Observable emit path.
- `preLog` / `postLog` / `errorLog` each accept a literal string or a callback; an empty string — literal or callback-returned — is treated as "log nothing" (checked with `isNotEmptyString` before calling the transport).
- `errorLog`'s second transport argument is the thrown value only when `isError(error)` is true; non-`Error` throws (e.g. `throw 42`) pass `undefined` instead of being coerced into a synthetic `Error`.
- Return-shape handling: sync methods run `postLog`/`errorLog` immediately around `next()`; Promise-returning methods fire `postLog`/`errorLog` once on settle (resolve or reject) via `.then(onSuccess, onError)`; Observable-returning methods fire `postLog` per emission via `tap()` and `errorLog` once via `catchError()`, which re-throws through `throwError` so the error still reaches the subscriber.
- Automatic type narrowing: `preLog`/`postLog`/`errorLog` use the spread form `(...args: TArgs) => string`, inferring parameter types straight from the decorated method's own signature — no explicit factory generics needed, including when `TResult` is unwrapped from a `Promise`/`Observable` via `GetResultType`.
- A single `@Log(...)` decorator instance works unmodified across sync, Promise, and Observable methods on the same class — verified by the "unification" describe block in the spec.

### Dependencies

- `@rnw-community/decorators-core` — `createInterceptor`, `InterceptorMiddleware`
- `@rnw-community/shared` — `isError`, `isNotEmptyString`, `isPromise`, `isString`
- **Optional peer**: `rxjs` — only touched at runtime via `isObservable` when a decorated method returns an `Observable`
- **Optional peer**: `typescript` (`>=5.2.0`)

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines).
