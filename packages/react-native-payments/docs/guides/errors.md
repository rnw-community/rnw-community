# Error handling

Every throw/reject in this package maps to one of three error shapes:

- **`ConstructorError`** — a native `TypeError` (`instanceof TypeError`, `name === 'TypeError'`) for
  `new PaymentRequest(...)` validation failures: missing/invalid payment methods, total, display items or
  shipping options. This matches the W3C algorithm, which validates the constructor's dictionaries via WebIDL and
  `check and canonicalize (total) amount`, both of which throw `TypeError`.
- **`DOMException`** (`instanceof DOMException`, `error.name` is the W3C name) — for the spec-mandated runtime
  states: `AbortError`, `InvalidStateError`, `NotAllowedError`, `NotSupportedError`. `SecurityError` is defined
  but not currently reachable from this implementation (no permission-policy check exists in React Native).
- **`PaymentsError`** — a plain domain error (`instanceof Error`, `name === 'Error'`) for failures the W3C spec
  does not name: `show()` rejecting with a non-`Error` reason from the native module bridge (an `Error` reason is
  propagated as-is instead), every `abort()` rejection from the native module bridge regardless of the rejection
  reason's type, and a native payment response payload that fails to parse (malformed or syntactically valid but
  incomplete JSON from the platform SDK, including direct construction of
  `AndroidPaymentResponse`/`IosPaymentResponse` with malformed tokenization data).

```ts
import { DOMException } from '@rnw-community/react-native-payments';

try {
    await paymentRequest.show();
} catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
        // user cancelled
    }
}
```

| Public API failure | Spec-mandated error | Implemented as |
| --- | --- | --- |
| `new PaymentRequest()` with no/invalid payment methods | `TypeError` | `ConstructorError` (`instanceof TypeError`) |
| `new PaymentRequest()` with missing/invalid/negative total | `TypeError` | `ConstructorError` |
| `new PaymentRequest()` with invalid display items | `TypeError` | `ConstructorError` |
| `new PaymentRequest()` with invalid shipping options | `TypeError` | `ConstructorError` |
| `new PaymentRequest()` with no platform-matching payment method | `NotSupportedError` | `DOMException` (thrown at construction, see [architecture.md](../architecture.md)) |
| `canMakePayment()` when not `created` | `InvalidStateError` | `DOMException` |
| `show()` when not `created` | `InvalidStateError` | `DOMException` |
| `show()` after the user cancels the native sheet | `AbortError` | `DOMException` |
| `abort()` when not `interactive` | `InvalidStateError` | `DOMException` |
| `abort()` resolves a pending `show()` | `AbortError` | `DOMException` |
| `PaymentRequestUpdateEvent.updateWith()` called twice for one event | `InvalidStateError` | `DOMException` |
| `PaymentResponse.complete()` / `retry()` called after `complete()` | `InvalidStateError` | `DOMException` |
| `PaymentResponse.complete()` called after `retry()` | `InvalidStateError` | `DOMException` (see [retry.md](./retry.md)) |
| `PaymentResponse.retry()` called a second time on the same response | `InvalidStateError` | `DOMException` (see [retry.md](./retry.md)) |
| `PaymentResponse.retry()` on a native binary built before this method existed | `NotSupportedError` | `DOMException` |
| Native module bridge rejects `show()` with a non-`Error` reason | _(not specified)_ | `PaymentsError` |
| Native module bridge rejects `abort()` (any reason) | _(not specified)_ | `PaymentsError` |
| Native module bridge rejects `retry()` (any reason) | _(not specified)_ | `PaymentsError` |
| Native payment response payload is malformed or incomplete JSON (incl. direct `AndroidPaymentResponse`/`IosPaymentResponse` construction) | _(not specified)_ | `PaymentsError` |
| An `updateWith()` listener answers with an invalid total/items/options | _(not specified — spec treats this as no update)_ | Logged via `console.warn`, change event answered with unchanged details |
| Native module is not linked (`Payments` bridge missing) | _(not specified — build/config error)_ | `Error` |

## References

- [api/constructor-error.md](../api/constructor-error.md)
- [api/dom-exception.md](../api/dom-exception.md)
- [api/payments-error.md](../api/payments-error.md)
- [api/payments-error-enum.md](../api/payments-error-enum.md)
