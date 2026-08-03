# `IosPKToken`

## What & why

The Apple Pay token exposed as `paymentResponse.details.applePayToken` on an
[`IosPaymentResponse`](./ios-payment-response.md), carrying the PassKit payment data. Reach for it to read the
tokenized card data to send to your payment gateway.

## How

| Member | Type | Notes |
| --- | --- | --- |
| `paymentData` | `IosPaymentData` | The decrypted-shape payment data — send this to your payment processor. |
| `paymentMethod.displayName` / `.network` / `.type` | `string` / `string` / `IosPKPaymentMethodType` | Describes the card used for the payment. |
| `transactionIdentifier` | `string` | Correlates the payment attempt with Apple's servers. |

## Example

```ts
import { IosPaymentResponse } from '@rnw-community/react-native-payments';

const response = await paymentRequest.show();

if (response instanceof IosPaymentResponse) {
    const token = response.details.applePayToken;

    token.transactionIdentifier;
}
```

## Pitfalls

Consumers do not construct this token directly — it comes back parsed from `show()`. Direct construction with
malformed tokenization data throws `PaymentsError` — see [guides/errors.md](../guides/errors.md).

## References

- [Apple Pay payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc)
- [api/ios-payment-response.md](./ios-payment-response.md)
