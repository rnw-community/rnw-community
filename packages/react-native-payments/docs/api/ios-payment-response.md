# `IosPaymentResponse`

## What & why

The `PaymentResponse` subclass `show()` resolves with on iOS. Reach for it when you need to branch on the
platform response type or read the Apple Pay token via `details.applePayToken` — see
[api/ios-pk-token.md](./ios-pk-token.md).

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `IosPaymentResponse` | `class extends PaymentResponse` | Parsed from the PassKit payment token. Consumers do not construct it directly — it comes back from `show()`. |
| `IosPaymentResponse.details.applePayToken` | `IosPKToken` | The Apple Pay token exposed on the response, carrying the PassKit payment data — see [api/ios-pk-token.md](./ios-pk-token.md). |

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

- A native payment response payload that fails to parse (malformed or incomplete JSON from PassKit, including
  direct construction of `IosPaymentResponse` with malformed tokenization data) throws `PaymentsError` — see
  [guides/errors.md](../guides/errors.md).

## References

- [api/payment-response.md](./payment-response.md)
- [api/ios-pk-token.md](./ios-pk-token.md)
- [Apple Pay payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc)
