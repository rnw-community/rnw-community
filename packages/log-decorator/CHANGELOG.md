# @rnw-community/log-decorator

## 0.2.0

### Breaking changes

**`postLog` and `errorLog` callbacks now receive `durationMs` as the second positional argument**, before the method's `...args` spread. Static-string forms of the hooks are unchanged.

Before:

```ts
@Log(
    orderId => `placing ${orderId}`,
    (result, orderId) => `placed ${orderId}: ${result.id}`,
    (error, orderId) => `failed ${orderId}: ${String(error)}`
)
placeOrder(orderId: string): { id: string } { /* ... */ }
```

After:

```ts
@Log(
    orderId => `placing ${orderId}`,
    (result, durationMs, orderId) => `placed ${orderId} in ${durationMs}ms: ${result.id}`,
    (error, durationMs, orderId) => `failed ${orderId} after ${durationMs}ms: ${String(error)}`
)
placeOrder(orderId: string): { id: string } { /* ... */ }
```

Migration: insert a second positional parameter (name it `_durationMs` to ignore) in every function form of `postLog`/`errorLog`. TypeScript infers parameter types without explicit generics, so inference for `result`/`error`/trailing `...args` is unchanged.

`preLog` is unaffected — no duration exists before the method runs.
