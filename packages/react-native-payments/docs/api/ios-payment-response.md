# `IosPaymentResponse` / `IosPKToken`

The `PaymentResponse` subclass `show()` resolves with on iOS, and the PassKit payment token it carries. Reach for
`IosPaymentResponse` when you need to branch on the platform response type; reach for `IosPKToken` to read the
Apple Pay token to send to your gateway.

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `IosPaymentResponse` | `class extends PaymentResponse` | Parsed from the PassKit payment token. Consumers do not construct it directly — it comes back from `show()`. |
| `IosPaymentResponse.details.applePayToken` | `IosPKToken` | The Apple Pay token exposed on the response, carrying the PassKit payment data. |
| `IosPKToken.transactionIdentifier` | `string` | Correlates the payment attempt with Apple's servers. |

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
- [Apple Pay payment token reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference?language=objc)
