# @rnw-community/rxjs-errors

RxJS pipeable operators for typed error handling — `filterWithException` (type-guard-aware filter that throws instead
of silently dropping) and `rethrowException` (catch, log, then rethrow or wrap).

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  operator/
    filter-with-exception-operator/
      filter-with-exception.operator.ts   — filterWithException(passingCondition, errorCodeOrMsgFn, createError?)
    rethrow-exception-operator/
      rethrow-exception.operator.ts       — rethrowException(errStringOrMessageFn, logFn, ErrorCtor?, createError?)
  type/
    create-error-fn.type.ts      — CreateErrorFn = (msg: string) => Error, + defaultCreateError(ErrorCtor) factory
    error-code-or-msg-fn.type.ts — ErrorCodeOrMsgFn<TInput> = string | ((val: TInput) => string)
    error-ctor.type.ts           — ErrorCtor = new (msg: string, ...args: never[]) => Error
  rxjs-filter-error.ts           — RxJSFilterError extends Error (the default error class for both operators)
  index.ts                      — re-exports RxJSFilterError, filterWithException, rethrowException
```

### Key Patterns

- `filterWithException(passingCondition, errorCodeOrMsgFn, createError = defaultCreateError(RxJSFilterError))` uses
  `concatMap` (not `filter`) so it can replace a passing value with `of(val)` and a failing one with
  `throwError(() => createError(...))` in the same operator — a plain `filter` cannot throw
- `passingCondition` accepts either a plain predicate or a type guard (`(val: TInput) => val is TOutput`), so the
  observable's emitted type narrows to `TOutput` on the happy path without an extra cast
- `rethrowException(errStringOrMessageFn, logFn, ErrorCtor = RxJSFilterError, createError = defaultCreateError(ErrorCtor))`
  wraps `catchError`: it always resolves the message (string or `(err: unknown) => string`), always calls
  `logFn(`${message}: ${getErrorMessage(err)}`)`, then rethrows the original error unchanged if it is already an
  `instanceof ErrorCtor`, otherwise rethrows `createError(message)` — this avoids double-wrapping an error that was
  already produced by an earlier `rethrowException`/`filterWithException` in the same pipe
- `ErrorCodeOrMsgFn<TInput>` is the shared union (`string | ((val: TInput) => string)`) both operators use for their
  message argument, letting callers pass a dynamic, value-dependent message
- `defaultCreateError(ErrorCtor)` is the shared factory (`msg => new ErrorCtor(msg)`) both operators fall back to when
  no explicit `createError` is supplied
- `ErrorCtor`'s constructor signature is `new (msg: string, ...args: never[]) => Error` — the `never[]` rest
  deliberately blocks constructors that require more than a message

### Dependencies

- `@rnw-community/shared` — `getErrorMessage` extracts a safe `.message` string inside `rethrowException`'s log line
- Peer: `rxjs` (^7.8.1)
- DevDependency `expect-type` is used only in `filter-with-exception.operator.spec.ts` to assert compile-time type
  narrowing on the type-guard overload

### Coverage

Default monorepo threshold: 99.9% on all metrics.
