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
| `intermediateSigningKey` | `{ signatures: string[]; signedKey: AndroidSignedKey }` | The intermediate signing key used to verify the token signature. |
| `protocolVersion` | `string` | The protocol version of the signed message (e.g. `ECv2`); `''` for a gateway-issued token. |
| `signature` | `string` | The signature over `signedMessage`. |
| `signedMessage` | `{ encryptedMessage: string; ephemeralPublicKey: string; tag: string }` | The encrypted message envelope — see [Google Pay payment data cryptography](https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#signed-message). |
| `rawToken` | `string` | The untouched `tokenizationData.token` string as returned by Google Pay — the value to send to your gateway. |

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

- `protocolVersion`, `signature`, `signedMessage` and `intermediateSigningKey` are only filled in when the token is
  Google's signed-message envelope: always for `directConfig` (`DIRECT`) tokenization, and for `gatewayConfig`
  (`PAYMENT_GATEWAY`) gateways that forward Google's encrypted payload. A gateway that issues its own token instead
  (Stripe returns a Stripe Token JSON, Braintree a JSON carrying a nonce) leaves them at their empty defaults — send
  `rawToken` to the gateway and parse it as that gateway documents. You chose the tokenization type yourself through
  `gatewayConfig` or `directConfig`, so branch on that rather than on empty fields.

- `AndroidPaymentMethodToken` is a plain TypeScript interface with no runtime validation of its own —
  constructing an object that merely matches its shape never throws. `PaymentsError` is thrown by
  [`AndroidPaymentResponse`](./android-payment-response.md), not by this token type: when the native JSON payload is
  malformed or incomplete, when the token is missing, when a `DIRECT` token is not a complete signed-message
  envelope, or when an envelope's `signedMessage` / `signedKey` is not valid JSON. A non-envelope `PAYMENT_GATEWAY`
  token is not an error — see [guides/errors.md](../guides/errors.md).

## References

- [Google Pay API for Android — response objects](https://developers.google.com/pay/api/android/reference/response-objects)
- [api/android-payment-response.md](./android-payment-response.md)
