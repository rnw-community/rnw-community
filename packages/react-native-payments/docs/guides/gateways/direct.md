# Direct tokenization (self-decrypt)

Decrypt the Apple Pay and Google Pay payloads on your own servers and send the card data to your processor
yourself. Only for merchants with their own PCI DSS scope — every PSP recipe in this folder avoids it.

## Values

| Value | Where | Source | Verified |
| --- | --- | --- | --- |
| `directConfig: { protocolVersion: 'ECv2', publicKey }` (Google Pay `DIRECT` tokenization) | `directConfig` | [Google Pay — `DIRECT` parameters](https://developers.google.com/pay/api/android/reference/request-objects#direct) | 2026-10-16 |
| `publicKey`: base64 elliptic-curve public key, uncompressed point format, registered in the Google Pay & Wallet Console, rotated yearly | `directConfig` | [Google Pay — payment data cryptography](https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography) | 2026-10-16 |
| Eligibility: PCI DSS certification by a Qualified Security Assessor; not available to third-party gateways and processors | Google Pay | [Google Pay — `DIRECT` parameters](https://developers.google.com/pay/api/android/reference/request-objects#direct) | 2026-10-16 |
| `PaymentMethodTokenRecipient` (Tink), `recipientId("merchant:<your merchant id>")`, `INSTANCE_TEST` / `INSTANCE_PRODUCTION` signing keys | backend | [Google Pay — payment data cryptography](https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography) | 2026-10-16 |
| Apple Pay `paymentData`: `version` `EC_v1` or `RSA_v1`, `header.ephemeralPublicKey` (EC) / `wrappedKey` (RSA), `publicKeyHash`, `transactionId` | backend | [Apple — payment token format reference](https://developer.apple.com/documentation/passkit/payment-token-format-reference) | 2026-10-16 |

## 1. Account setup

- **Google Pay** — generate an EC key pair, register the public key in the
  [Google Pay & Wallet Console](https://pay.google.com/business/console) under **Google Pay API › Direct
  integration**, and keep the private key on your server.
- **Apple Pay** — create the Apple Pay Payment Processing Certificate from a CSR you generate yourself, and keep its
  private key on your server. Add the merchant ID to the app's entitlement — see
  [quickstart-ios.md](../../getting-started/quickstart-ios.md).

## 2. Method data

```ts
import { createApplePayMethodData, createGooglePayMethodData } from '@rnw-community/react-native-payments';

const methodData = [
    createApplePayMethodData({
        merchantIdentifier: 'merchant.com.your-app',
        countryCode: 'US',
        currencyCode: 'USD',
    }),
    createGooglePayMethodData({
        countryCode: 'US',
        currencyCode: 'USD',
        directConfig: { protocolVersion: 'ECv2', publicKey: 'your-base64-uncompressed-ec-public-key' },
    }),
];
```

## 3. Read the token

- **Android** — `response.details.androidPayToken` is Google's ECv2 envelope already split into `protocolVersion`,
  `signature`, `intermediateSigningKey` and `signedMessage`. Forward `rawToken` — the decryption libraries verify
  signatures over the original strings.
- **iOS** — forward `JSON.stringify(response.details.applePayToken.paymentData)`.

## 4. Backend

1. **Google Pay** — unseal `rawToken` with Tink's `PaymentMethodTokenRecipient` (`protocolVersion("ECv2")`, your
   `merchant:` recipient id, your private key, Google's `INSTANCE_TEST` signing keys in `TEST`). The decrypted
   message carries the card or network token and, for tokenized cards, a cryptogram.
2. **Apple Pay** — follow Apple's steps: verify the signature and its certificate chain to Apple Root CA - G3, reject
   a signing time more than five minutes from the transaction time, select your certificate by `publicKeyHash`,
   restore the symmetric key, decrypt `data` (AES-256-GCM for `EC_v1`), reject a `transactionId` you already
   processed, and check `currencyCode`, `transactionAmount` and `applicationData` against your order.
3. Send the decrypted credentials to your processor, and map its result to `PaymentComplete`.

## 5. Sandbox checklist

- [ ] Google Pay: `environment` left at `TEST`, and the recipient uses Google's test signing keys
      (`INSTANCE_TEST`). Google's [test card suite](https://developers.google.com/pay/api/android/guides/resources/test-card-suite)
      returns placeholder card data — use it to exercise decryption, not to charge.
- [ ] Apple Pay: an [App Store Connect sandbox tester](https://developer.apple.com/apple-pay/sandbox-testing/) with
      an Apple test card, and a payload that decrypts with your processing certificate's private key.
- [ ] Your servers that touch decrypted data are in your PCI DSS scope before going live.

## Sources

- [Google Pay API — request objects, `DIRECT`](https://developers.google.com/pay/api/android/reference/request-objects#direct)
- [Google Pay API — payment data cryptography](https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography)
- [Apple — payment token format reference](https://developer.apple.com/documentation/passkit/payment-token-format-reference)
