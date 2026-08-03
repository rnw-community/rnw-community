# `PaymentsError`

## What & why

A plain domain error for failures the W3C spec does not name — the catch-all for native bridge and
payload-parsing failures. Reach for `instanceof PaymentsError` combined with excluding `DOMException` to catch
only this shape (see Pitfalls — neither check alone is unambiguous).

## How

| Trigger |
| --- |
| `show()` rejecting with a non-`Error` reason from the native module bridge (an `Error` reason is propagated as-is instead — see Pitfalls). |
| Every `abort()` rejection from the native module bridge, regardless of the rejection reason's type. |
| A native payment response payload that fails to parse (malformed or incomplete JSON, including direct construction of `AndroidPaymentResponse`/`IosPaymentResponse` with malformed tokenization data). |

## Example

```ts
import { DOMException, PaymentsError } from '@rnw-community/react-native-payments';

try {
    await paymentRequest.abort();
} catch (error) {
    if (error instanceof PaymentsError && !(error instanceof DOMException)) {
        // this package's own catch-all — not a raw native rejection, not a DOMException
    }
}
```

## Pitfalls

- **`instanceof PaymentsError` alone also matches `DOMException`** — `DOMException extends PaymentsError` in
  this package's error hierarchy, so a bare `instanceof PaymentsError` check catches every spec-mapped
  abort/invalid-state/not-supported error too, not just the failures documented above.
- **`error.name === 'Error'` alone also matches a raw propagated native rejection** — when `show()`'s native
  bridge rejects with a reason that is already an `Error` instance, that `Error` is propagated **unchanged**
  (not wrapped in `PaymentsError`), and an ordinary `Error` also has `name === 'Error'` by default without being
  `instanceof PaymentsError` at all. Neither check alone is unambiguous; use
  `error instanceof PaymentsError && !(error instanceof DOMException)` together, as in the example.
- Not spec-mandated — do not branch on `error.name` the way you would for `DOMException`; `PaymentsError`
  inherits the default `Error.prototype.name` (`'Error'`) instead of a stable W3C name.

## References

- [guides/errors.md](../guides/errors.md)
