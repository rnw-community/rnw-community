# `AndroidPaymentResponse` / `AndroidPaymentMethodToken`

The `PaymentResponse` subclass `show()` resolves with on Android, and the Google Pay payment token it carries.
Reach for `AndroidPaymentResponse` when you need to branch on the platform response type; reach for
`AndroidPaymentMethodToken` to read the Google Pay token to send to your gateway.

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `AndroidPaymentResponse` | `class extends PaymentResponse` | Parsed from the Google Pay JSON payload. Consumers do not construct it directly — it comes back from `show()`. |
| `AndroidPaymentResponse.details.androidPayToken` | `AndroidPaymentMethodToken` | The Google Pay token exposed on the response. |
| `AndroidPaymentMethodToken.cardInfo.cardNetwork` | `string` | The card network of the tokenized card. |

## Example

```ts
import { AndroidPaymentResponse } from '@rnw-community/react-native-payments';

const response = await paymentRequest.show();

if (response instanceof AndroidPaymentResponse) {
    response.details.androidPayToken.cardInfo.cardNetwork;
}
```

## Pitfalls

- A native payment response payload that fails to parse (malformed or incomplete JSON from Google Pay, including
  direct construction of `AndroidPaymentResponse` with malformed tokenization data) throws `PaymentsError` — see
  [guides/errors.md](../guides/errors.md).

## References

- [api/payment-response.md](./payment-response.md)
- [Google Pay API for Android — response objects](https://developers.google.com/pay/api/android/reference/request-objects)
