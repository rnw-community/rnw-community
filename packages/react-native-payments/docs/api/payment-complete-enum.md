# `PaymentComplete`

The outcome passed to `PaymentResponse.complete()` to close the sheet. Reach for it right after your backend has
confirmed (or rejected) the charge.

## How

| Member | Meaning |
| --- | --- |
| `Success` | The payment was confirmed by your backend. |
| `Fail` | The payment failed or your backend rejected it. |
| `Unknown` | The outcome could not be determined. |

## Example

```ts
import { PaymentComplete } from '@rnw-community/react-native-payments';

paymentResponse.complete(PaymentComplete.Success); // OR PaymentComplete.Fail
```

## Pitfalls

- Only call `complete(PaymentComplete.Success)` once your backend has actually confirmed the charge — completing
  with `Success` before that point tells the sheet (and the user) the payment went through even if it didn't.
- Has no effect on Android — see [platforms/android.md](../platforms/android.md).

## References

- [api/payment-response.md](./payment-response.md)
