# `IosPKToken`

## What & why

The Apple Pay token exposed as `paymentResponse.details.applePayToken` on an
[`IosPaymentResponse`](./ios-payment-response.md), carrying the PassKit payment data. Reach for it to read the
tokenized card data to send to your payment gateway.

## How

| Member | Type | Notes |
| --- | --- | --- |
| `paymentData` | `IosPaymentData` | The still-**encrypted** payment token envelope (`data`, `header`, `signature`, `version`) — send it to your e-commerce backend, where it is decrypted with your payment processing certificate and submitted to your payment processor. |
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

- `IosPKToken` is a plain TypeScript interface with no runtime validation of its own — constructing an object
  that merely matches its shape never throws. `PaymentsError` is thrown by
  [`IosPaymentResponse`](./ios-payment-response.md) when it parses a malformed or incomplete native JSON payload
  (including direct construction of `IosPaymentResponse` with malformed tokenization data), not by this token
  type — see [guides/errors.md](../guides/errors.md).
- `paymentData` is never decrypted by this package — decrypt it on your backend with your payment processing
  certificate before submitting it to your processor.

## References

- [Apple Pay payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc)
- [api/ios-payment-response.md](./ios-payment-response.md)
