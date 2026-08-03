# `PaymentComplete`

## What & why

The outcome passed to `PaymentResponse.complete()` to close the sheet. Reach for it right after your backend has
confirmed (or rejected) the charge.

## How

| Member | Runtime value | Meaning |
| --- | --- | --- |
| `SUCCESS` | `'success'` | The payment was confirmed by your backend. |
| `FAIL` | `'fail'` | The payment failed or your backend rejected it. |
| `UNKNOWN` | `'unknown'` | The outcome could not be determined. |

## Example

```ts
import { PaymentComplete } from '@rnw-community/react-native-payments';

paymentResponse.complete(PaymentComplete.SUCCESS); // OR PaymentComplete.FAIL
```

## Pitfalls

- Only call `complete(PaymentComplete.SUCCESS)` once your backend has actually confirmed the charge — completing
  with `SUCCESS` before that point tells the sheet (and the user) the payment went through even if it didn't.
- Has no effect on Android — see [platforms/android.md](../platforms/android.md).

## References

- [api/payment-response.md](./payment-response.md)
