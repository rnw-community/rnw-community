# Checkout.com

Charge Apple Pay and Google Pay through [Checkout.com](https://www.checkout.com/docs)'s Unified Payments API. Both
wallets go through the same two calls: exchange the wallet token for a Checkout.com `tok_…` token with
`POST /tokens`, then pay with it through `POST /payments`.

## Values

| Value | Where | Source | Verified |
| --- | --- | --- | --- |
| `gateway: 'checkoutltd'` | `gatewayConfig` | [Google Pay tutorial — Checkout.com row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization), [Checkout.com — Google Pay](https://www.checkout.com/docs/payments/add-payment-methods/google-pay/unified-payments-api) | 2026-10-16 |
| `gatewayMerchantId`: your Checkout.com **public** key | `gatewayConfig` | [Checkout.com — Google Pay](https://www.checkout.com/docs/payments/add-payment-methods/google-pay/unified-payments-api) | 2026-10-16 |
| Merchant ID with a Checkout.com-issued CSR (`POST /applepay/signing-requests`) | `merchantIdentifier` | [Checkout.com — Apple Pay](https://www.checkout.com/docs/payments/add-payment-methods/apple-pay/unified-payments-api) | 2026-10-16 |
| `https://{prefix}.api.sandbox.checkout.com` (live: `https://{prefix}.api.checkout.com`) | backend | [Checkout.com — API endpoints](https://www.checkout.com/docs/developer-resources/api/api-endpoints) | 2026-10-16 |
| `POST /tokens` with `type: 'googlepay'`, `token_data: { protocolVersion, signature, signedMessage }`, authenticated with the public key | backend | [Checkout.com — Google Pay](https://www.checkout.com/docs/payments/add-payment-methods/google-pay/unified-payments-api) | 2026-10-16 |
| `POST /tokens` with `type: 'applepay'`, `token_data: { version, data, signature, header: { ephemeralPublicKey, publicKeyHash, transactionId } }` | backend | [Checkout.com — Apple Pay](https://www.checkout.com/docs/payments/add-payment-methods/apple-pay/unified-payments-api) | 2026-10-16 |
| `POST /payments` with `source: { type: 'token', token: 'tok_…' }`, `Authorization: Bearer sk_sbox_…` | backend | [Checkout.com — Apple Pay](https://www.checkout.com/docs/payments/add-payment-methods/apple-pay/unified-payments-api), [API keys](https://www.checkout.com/docs/developer-resources/api/manage-api-keys/api-keys) | 2026-10-16 |

`{prefix}` is the first eight characters of your `client_id` without the `cli_` prefix, and differs between sandbox
and production. Requests to a base URL without it are rejected with `403` and `error_type: base_url_invalid`.

## 1. Account setup

- **Apple Pay** — create the CSR through Checkout.com: `POST /applepay/signing-requests` with
  `{ "protocol_version": "ec_v1" }`, save the response `content` as a `.csr` file (it expires after 24 hours), create
  the Apple Pay Payment Processing Certificate from it in the Apple Developer portal, then upload the downloaded
  certificate, base64-encoded, with `POST /applepay/certificates`. Add the merchant ID to the app's entitlement —
  see [quickstart-ios.md](../../getting-started/quickstart-ios.md).
- **Google Pay** — nothing to configure for `TEST`; Checkout.com validates the Google merchant ID only in
  production.

## 2. Method data

```ts
import { createApplePayMethodData, createGooglePayMethodData } from '@rnw-community/react-native-payments';

const methodData = [
    createApplePayMethodData({
        merchantIdentifier: 'merchant.com.your-app',
        countryCode: 'GB',
        currencyCode: 'GBP',
    }),
    createGooglePayMethodData({
        countryCode: 'GB',
        currencyCode: 'GBP',
        gatewayConfig: { gateway: 'checkoutltd', gatewayMerchantId: 'pk_sbox_your_public_key' },
    }),
];
```

## 3. Read the token

- **Android** — `response.details.androidPayToken.rawToken`, the Google Pay encrypted envelope string. Forward it
  unchanged: `signedMessage` must reach Checkout.com as the exact string Google produced, so build `token_data` on
  the backend from `JSON.parse(rawToken)` rather than from the parsed `androidPayToken` fields.
- **iOS** — `JSON.stringify(response.details.applePayToken.paymentData)`; its `version`, `data`, `signature` and
  `header` are the `token_data` fields as-is.

The [shared flow](./index.md#the-flow-every-recipe-shares) shows the client code for both.

## 4. Backend

1. Exchange the wallet token. Checkout.com documents the Google Pay call as authenticated with the same public key
   as `gatewayMerchantId`; its Apple Pay page does not name the key, so confirm it in sandbox:
    - Google Pay: `POST /tokens` with `{ type: 'googlepay', token_data: { protocolVersion, signature, signedMessage } }`,
      copying the three fields from `JSON.parse(rawToken)`. Checkout.com's example shows only these three fields
      (with an `ECv1` token); if Google returns an `ECv2` token, its `intermediateSigningKey` is not part of the
      documented request — validate the call in sandbox.
    - Apple Pay: `POST /tokens` with `{ type: 'applepay', token_data: { version, data, signature, header } }`, where
      `header` carries `ephemeralPublicKey`, `publicKeyHash` and `transactionId`.
2. Pay with the returned `token` (`tok_…`): `POST /payments` with `{ source: { type: 'token', token }, amount,
   currency }` (`amount` in minor units), authenticated with your secret key.
3. An approved payment maps to `PaymentComplete.SUCCESS`.

## 5. Sandbox checklist

- [ ] All calls go to `https://{prefix}.api.sandbox.checkout.com` with sandbox keys (`pk_sbox_…`, `sk_sbox_…`).
- [ ] Google Pay: `environment` left at `TEST` and `gateway: 'checkoutltd'` (not `example`). In sandbox Google
      substitutes a test card, so no real card is charged.
- [ ] Apple Pay: the certificate was issued from a sandbox signing request and uploaded to the sandbox account, and
      an [App Store Connect sandbox tester](https://developer.apple.com/apple-pay/sandbox-testing/) is signed in on
      the device with an Apple test card in Wallet.
- [ ] `POST /tokens` returns a `tok_…` token for both wallets before you wire up `POST /payments`.

## Sources

- [Google Pay API — tutorial, tokenization and processor table](https://developers.google.com/pay/api/android/guides/tutorial#tokenization)
- [Checkout.com — Google Pay](https://www.checkout.com/docs/payments/add-payment-methods/google-pay/unified-payments-api),
  [Google Pay API-only](https://www.checkout.com/docs/payments/add-payment-methods/google-pay/api-only)
- [Checkout.com — Apple Pay](https://www.checkout.com/docs/payments/add-payment-methods/apple-pay/unified-payments-api)
- [Checkout.com — API endpoints](https://www.checkout.com/docs/developer-resources/api/api-endpoints),
  [API keys](https://www.checkout.com/docs/developer-resources/api/manage-api-keys/api-keys)
