# Braintree

Charge Apple Pay and Google Pay through [Braintree](https://developer.paypal.com/braintree/docs/) without
Braintree's native SDKs. Both wallets end in a Braintree payment method nonce that your server charges with
`Transaction: Sale`.

> Braintree's guides cover both wallets through its own SDKs. The Google Pay parameters come from Google's processor
> table, the token shape and the Apple Pay exchange from Braintree's public SDK sources and GraphQL schema — each
> marked below. If you would rather stay on Braintree's documented path, use its native SDKs instead of this package.

## Values

| Value | Where | Source | Verified |
| --- | --- | --- | --- |
| `gateway: 'braintree'` | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| `'braintree:apiVersion': 'v1'` | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| `'braintree:sdkVersion'` | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) fills it from `braintree.client.VERSION`; Braintree documents no value for SDK-less integrations | 2026-10-16 |
| `'braintree:merchantId'`: your Braintree merchant ID | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| `'braintree:clientKey'`: your Braintree tokenization key | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| no `gatewayMerchantId` | `gatewayConfig` | [Google Pay tutorial — Braintree row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| Google Pay token: `{ "androidPayCards": [{ "nonce": … }] }` | Android response | [braintree-web `google-payment.js` parser](https://braintree.github.io/braintree-web/current/google-payment_google-payment.js.html) | 2026-10-16 |
| Merchant ID with a Braintree-issued CSR | `merchantIdentifier` | [Braintree — Apple Pay configuration (iOS)](https://developer.paypal.com/braintree/docs/guides/apple-pay/configuration/ios/v6) | 2026-10-16 |
| GraphQL `tokenizeApplePayCard` with `applePaymentToken: { paymentData (base64), paymentInstrumentName, paymentNetwork, transactionIdentifier }` | backend (Apple Pay) | [Braintree public GraphQL schema](https://github.com/braintree/graphql-api/blob/master/schema.graphql) | 2026-10-16 |
| `Transaction: Sale` with the nonce as `payment_method_nonce` | backend | [Braintree — Google Pay server-side](https://developer.paypal.com/braintree/docs/guides/google-pay/server-side) | 2026-10-16 |

## 1. Account setup

- **Google Pay** — enable Google Pay in the Braintree Control Panel; it is required in sandbox too. For production
  you also complete Google's own go-live process.
- **Apple Pay** — in the Control Panel (gear icon › **Processing**) open the Apple Pay **Options**, add an iOS
  certificate and download Braintree's CSR, create the Apple Pay Payment Processing Certificate from it in the Apple
  Developer portal, and upload that certificate back under **Apple Merchant Certificates (iOS)**. Braintree requires its own CSR — do not generate one
  yourself. Add the merchant ID to the app's entitlement — see
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
        gatewayConfig: {
            gateway: 'braintree',
            'braintree:apiVersion': 'v1',
            'braintree:sdkVersion': 'your-braintree-sdk-version',
            'braintree:merchantId': 'your_braintree_merchant_id',
            'braintree:clientKey': 'sandbox_your_tokenization_key',
        },
    }),
];
```

## 3. Read the token

- **Android** — `response.details.androidPayToken.rawToken` is Braintree's JSON, not Google's encrypted envelope,
  so the envelope fields of `androidPayToken` stay empty. The nonce is `JSON.parse(rawToken).androidPayCards[0].nonce`.
  Send the nonce (or the whole `rawToken`) to your backend.
- **iOS** — send `JSON.stringify(applePayToken.paymentData)`, `applePayToken.paymentMethod.displayName`,
  `applePayToken.paymentMethod.network` and `applePayToken.transactionIdentifier`.

The [shared flow](./index.md#the-flow-every-recipe-shares) shows the client code for both.

## 4. Backend

1. **Apple Pay** — exchange the payment token for a nonce with the GraphQL `tokenizeApplePayCard` mutation, passing
   `applePaymentToken.paymentData` = base64 of the `paymentData` JSON, `paymentInstrumentName` = `displayName`,
   `paymentNetwork` = `network`, `transactionIdentifier`. The returned single-use payment method id is the nonce.
   The mutation is defined in Braintree's public schema but not described in its guides, so validate it in sandbox
   before relying on it.
2. Charge the nonce with `Transaction: Sale` (`amount` plus `payment_method_nonce`) through a Braintree server SDK,
   or with the GraphQL `chargePaymentMethod` mutation.
3. A successful sale maps to `PaymentComplete.SUCCESS`.

## 5. Sandbox checklist

- [ ] Google Pay is enabled in the sandbox Control Panel and `braintree:clientKey` is a sandbox tokenization key.
- [ ] Google Pay: `environment` left at `TEST`, and `JSON.parse(rawToken).androidPayCards[0].nonce` is present.
- [ ] Apple Pay: the processing certificate was created from the Braintree sandbox CSR, and an
      [App Store Connect sandbox tester](https://developer.apple.com/apple-pay/sandbox-testing/) is signed in on the
      device with an Apple test card in Wallet.
- [ ] Backend only: the [sandbox test nonces](https://developer.paypal.com/braintree/docs/reference/general/testing)
      `fake-android-pay-visa-nonce` and `fake-apple-pay-visa-nonce` exercise step 2 without a device.

## Sources

- [Google Pay API — tutorial, tokenization and processor table](https://developers.google.com/pay/api/android/guides/tutorial#tokenization)
- [Braintree — Google Pay configuration](https://developer.paypal.com/braintree/docs/guides/google-pay/configuration),
  [server-side](https://developer.paypal.com/braintree/docs/guides/google-pay/server-side)
- [Braintree — Apple Pay configuration (iOS)](https://developer.paypal.com/braintree/docs/guides/apple-pay/configuration/ios/v6)
- [Braintree — testing reference](https://developer.paypal.com/braintree/docs/reference/general/testing)
- [Braintree GraphQL schema](https://github.com/braintree/graphql-api/blob/master/schema.graphql)
- [braintree-web — Google Pay token parser](https://braintree.github.io/braintree-web/current/google-payment_google-payment.js.html)
