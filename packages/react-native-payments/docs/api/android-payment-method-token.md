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
| `intermediateSigningKey` | `{ signatures: string; signedKey: AndroidSignedKey }` | The intermediate signing key used to verify the token signature — see Pitfalls for a known type/runtime mismatch on `signatures`. |
| `protocolVersion` | `string` | The protocol version of the signed message (e.g. `ECv2`). |
| `signature` | `string` | The signature over `signedMessage`. |
| `signedMessage` | `{ encryptedMessage: string; ephemeralPublicKey: string; tag: string }` | The encrypted message envelope — see [Google Pay payment data cryptography](https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#signed-message). |
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

- `AndroidPaymentMethodToken` is a plain TypeScript interface with no runtime validation of its own —
  constructing an object that merely matches its shape never throws. `PaymentsError` is thrown by
  [`AndroidPaymentResponse`](./android-payment-response.md) when it parses a malformed or incomplete native JSON
  payload (including direct construction of `AndroidPaymentResponse` with malformed tokenization data), not by
  this token type — see [guides/errors.md](../guides/errors.md).
- **`intermediateSigningKey.signatures` is declared `string` in this package's shipped type
  (`AndroidIntermediateSigningKey`/`AndroidRawIntermediateSigningKey`), but the real Google Pay payload sends an
  array of signatures** — this package's own test fixtures construct the raw native payload with
  `signatures: ['testSignature']`, and Google's own Payment Data Cryptography reference documents
  `IntermediateSigningKey.signatures` as `string[]`. The value is passed through unparsed (nothing in this
  package reads `.signatures`), so treat the declared `string` type as unreliable until the type is corrected —
  check the actual runtime value's shape before assuming either type.

## References

- [Google Pay API for Android — response objects](https://developers.google.com/pay/api/android/reference/response-objects)
- [api/android-payment-response.md](./android-payment-response.md)
