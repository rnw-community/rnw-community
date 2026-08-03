# `PaymentsError`

A plain domain error for failures the W3C spec does not name. Reach for `instanceof Error` with
`name === 'Error'` to catch it; it is the catch-all for native bridge and payload-parsing failures.

## How

| Trigger |
| --- |
| `show()` rejecting with a non-`Error` reason from the native module bridge (an `Error` reason is propagated as-is instead). |
| Every `abort()` rejection from the native module bridge, regardless of the rejection reason's type. |
| A native payment response payload that fails to parse (malformed or incomplete JSON, including direct construction of `AndroidPaymentResponse`/`IosPaymentResponse` with malformed tokenization data). |

## Example

```ts
try {
    await paymentRequest.abort();
} catch (error) {
    if (error instanceof Error && error.name === 'Error') {
        // native bridge rejection
    }
}
```

## Pitfalls

- **`instanceof PaymentsError` also matches `DOMException`** — `DOMException extends PaymentsError` in this
  package's error hierarchy, so a bare `instanceof PaymentsError` check catches every spec-mapped abort/invalid-
  state/not-supported error too, not just the failures documented above. Use `error instanceof Error &&
  error.name === 'Error'` (as in the example) to catch only this catch-all shape, or check
  `!(error instanceof DOMException)` first if you need `instanceof PaymentsError` for some other reason.
- Not spec-mandated — do not branch on `error.name` the way you would for `DOMException`; `PaymentsError`
  inherits the default `Error.prototype.name` (`'Error'`) instead of a stable W3C name.

## References

- [guides/errors.md](../guides/errors.md)
