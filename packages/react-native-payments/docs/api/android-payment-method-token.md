# `AndroidPaymentMethodToken`

## What & why

The Google Pay payment token exposed as `paymentResponse.details.androidPayToken` on an
[`AndroidPaymentResponse`](./android-payment-response.md). Reach for it to read the tokenized card data to send
to your payment gateway.

## How

| Member | Type | Notes |
| --- | --- | --- |
| `cardInfo.cardNetwork` | `string` | The card network of the tokenized card. |
| `cardInfo.cardDetails` | `string` | The last four digits or similar display detail, as returned by Google Pay. |
| `rawToken` | `string` | The raw tokenization payload as returned by Google Pay, before this package's parsing. |

## Example

```ts
import { AndroidPaymentResponse } from '@rnw-community/react-native-payments';

const response = await paymentRequest.show();

if (response instanceof AndroidPaymentResponse) {
    const token = response.details.androidPayToken;

    token.cardInfo.cardNetwork;
}
```

## Pitfalls

Consumers do not construct this token directly — it comes back parsed from `show()`. Direct construction with
malformed tokenization data throws `PaymentsError` — see [guides/errors.md](../guides/errors.md).

## References

- [Google Pay API for Android — response objects](https://developers.google.com/pay/api/android/reference/request-objects)
- [api/android-payment-response.md](./android-payment-response.md)
