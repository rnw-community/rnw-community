# @rnw-community/rxjs-errors

RxJS pipeable operators for typed error handling — `filterWithException` (type-guard-aware filter) and `rethrowException` (catch, log, rethrow/wrap).

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```
src/
  operator/
    filter-with-exception-operator/  — filterWithException (concatMap + throwError, supports type guards)
    rethrow-exception-operator/      — rethrowException (catchError, log, rethrow or wrap)
  type/
    create-error-fn.type.ts          — CreateErrorFn + defaultCreateError factory
    error-code-or-msg-fn.type.ts     — ErrorCodeOrMsgFn<TInput> = string | ((val) => string)
    error-ctor.type.ts               — ErrorCtor type
  rxjs-filter-error.ts              — RxJSFilterError extends Error (default error type)
```

### Key Patterns

- `filterWithException` uses `concatMap` (not `filter`) to replace passing items with `of(val)` and failing items with `throwError()`
- Supports type narrowing: `passingCondition` can be a type guard `(val: TInput) => val is TOutput`
- `rethrowException` avoids double-wrapping: `err instanceof ErrorCtor ? err : createError(message)`
- `ErrorCodeOrMsgFn<TInput>` union: string or `(val: TInput) => string` for dynamic error messages
- `defaultCreateError(ErrorCtor)` factory creates a `CreateErrorFn` from a constructor

### Dependencies

`@rnw-community/shared` (for `getErrorMessage`). Peer: `rxjs`.

### Coverage

Default: **99.9%** all metrics.
```
