# `AndroidPaymentResponse`

## What & why

The `PaymentResponse` subclass `show()` resolves with on Android. Reach for it when you need to branch on the
platform response type or read the Google Pay token via `details.androidPayToken` — see
[api/android-payment-method-token.md](./android-payment-method-token.md).

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `AndroidPaymentResponse` | `class extends PaymentResponse` | Parsed from the Google Pay JSON payload. Consumers do not construct it directly — it comes back from `show()`. |
| `AndroidPaymentResponse.details.androidPayToken` | `AndroidPaymentMethodToken` | The Google Pay token exposed on the response — see [api/android-payment-method-token.md](./android-payment-method-token.md). |

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
- [api/android-payment-method-token.md](./android-payment-method-token.md)
- [Google Pay API for Android — response objects](https://developers.google.com/pay/api/android/reference/response-objects)
