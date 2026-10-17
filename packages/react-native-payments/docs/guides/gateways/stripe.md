# Stripe

Charge Apple Pay and Google Pay through [Stripe](https://docs.stripe.com/) without Stripe's native SDKs. Both
wallets end in the same server step: turn the wallet token into a Stripe `tok_…` token, attach it to a
PaymentMethod, and confirm a PaymentIntent with it.

> Stripe documents both wallets primarily through its own SDKs. The Google Pay parameters come from Google's
> processor table, and the Apple Pay exchange step mirrors what Stripe's iOS SDK sends — both are marked below.
> If you would rather stay on Stripe's documented path, use
> [`@stripe/stripe-react-native`](https://docs.stripe.com/apple-pay?platform=react-native) instead of this package.

## Values

| Value | Where | Source | Verified |
| --- | --- | --- | --- |
| `gateway: 'stripe'` | `gatewayConfig` | [Google Pay tutorial — Stripe row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| `'stripe:version': '2018-10-31'` | `gatewayConfig` | [Google Pay tutorial — Stripe row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| `'stripe:publishableKey': 'pk_test_…'` | `gatewayConfig` | [Google Pay tutorial — Stripe row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) | 2026-10-16 |
| no `gatewayMerchantId` | `gatewayConfig` | [Google Pay tutorial — Stripe row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) lists only the three keys above | 2026-10-16 |
| Merchant ID registered with a Stripe-issued CSR | `merchantIdentifier` | [Stripe — Apple Pay, create a certificate](https://docs.stripe.com/apple-pay?platform=ios#csr) | 2026-10-16 |
| `POST /v1/payment_methods` with `type=card`, `card[token]=tok_…` | backend | [Stripe API — create a PaymentMethod (`card.token`)](https://docs.stripe.com/api/payment_methods/create) | 2026-10-16 |
| `POST /v1/payment_intents` with `payment_method`, `confirm=true` | backend | [Stripe API — create a PaymentIntent](https://docs.stripe.com/api/payment_intents/create) | 2026-10-16 |
| `POST /v1/tokens` with `pk_token`, `pk_token_instrument_name`, `pk_token_payment_network`, `pk_token_transaction_id` | backend (Apple Pay) | Not in Stripe's API reference — mirrors [stripe-ios `STPAPIClient+ApplePay.swift`](https://github.com/stripe/stripe-ios/blob/master/StripePayments/StripePayments/Source/API%20Bindings/STPAPIClient%2BApplePay.swift) | 2026-10-16 |

For Stripe Connect, Stripe's Android SDK sends `stripe:publishableKey` as `pk_…/acct_…` (publishable key, slash,
connected account id) — see
[stripe-android `GooglePayConfig.kt`](https://github.com/stripe/stripe-android/blob/master/payments-core/src/main/java/com/stripe/android/GooglePayConfig.kt).

## 1. Account setup

- **Apple Pay** — register a merchant ID in the Apple Developer portal, then in the Stripe Dashboard under
  [iOS certificates](https://dashboard.stripe.com/settings/ios_certificates) choose **Add new application**,
  download Stripe's CSR, create the Apple Pay Payment Processing Certificate from it and upload the `.cer` back to
  Stripe. Stripe can only decrypt `paymentData` encrypted for that certificate, so a CSR you generated yourself
  does not work. Add the merchant ID to the app's entitlement — see
  [quickstart-ios.md](../../getting-started/quickstart-ios.md).
- **Google Pay** — nothing to configure on Stripe for `TEST`. To go live, request production access in the Google
  Pay & Wallet Console with the **Gateway** integration type.

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
            gateway: 'stripe',
            'stripe:version': '2018-10-31',
            'stripe:publishableKey': 'pk_test_your_publishable_key',
        },
    }),
];
```

## 3. Read the token

- **Android** — `response.details.androidPayToken.rawToken` is a Stripe Token object serialized as JSON
  (`{ "id": "tok_…", "object": "token", "card": { "tokenization_method": "android_pay", … } }`). It is not
  Google's encrypted envelope, so the envelope fields of `androidPayToken` stay empty. Send `rawToken` to your
  backend, or parse it and send only `id`.
- **iOS** — send `JSON.stringify(applePayToken.paymentData)`, `applePayToken.paymentMethod.displayName`,
  `applePayToken.paymentMethod.network` and `applePayToken.transactionIdentifier`.

The [shared flow](./index.md#the-flow-every-recipe-shares) shows the client code for both.

## 4. Backend

1. **Google Pay** — parse the forwarded `rawToken` and take its `id` (`tok_…`).
2. **Apple Pay** — exchange the payment token for a Stripe token: `POST https://api.stripe.com/v1/tokens`
   (form-encoded) with `pk_token` = the `paymentData` JSON string, `pk_token_instrument_name` = `displayName`,
   `pk_token_payment_network` = `network`, `pk_token_transaction_id` = `transactionIdentifier`. The response is a
   Token object; take its `id`. This is the request stripe-ios sends with the publishable key; it is not part of
   Stripe's public API reference, so validate it in test mode before relying on it.
3. Create a PaymentMethod from the token: `POST /v1/payment_methods` with `type=card` and `card[token]=tok_…`.
4. Create and confirm a PaymentIntent: `POST /v1/payment_intents` with `amount`, `currency`,
   `payment_method=pm_…` and `confirm=true`, authenticated with your secret key.
5. Return the PaymentIntent `status` to the app; `succeeded` maps to `PaymentComplete.SUCCESS`. A
   `requires_action` status needs 3-D Secure, which this package cannot present — treat it as a failure or hand off
   to Stripe's SDK.

## 5. Sandbox checklist

- [ ] Google Pay: `environment` left at `TEST`, `stripe:publishableKey` is a `pk_test_…` key, and the test runs on a
      physical Android device with a card in Google Wallet (or a member of
      [Google's test card suite](https://developers.google.com/pay/api/android/guides/resources/test-card-suite)).
- [ ] Google Pay: `rawToken` parses to an object whose `id` starts with `tok_`, and the PaymentIntent shows up in the
      Stripe Dashboard in test mode.
- [ ] Apple Pay: the merchant ID's processing certificate was created from the Stripe CSR, and the test runs on a
      device with a **real** card in Wallet plus your test API keys — Stripe recognizes test mode and returns a test
      card token (see [Stripe — testing Apple Pay](https://docs.stripe.com/apple-pay?platform=ios#testing)).
- [ ] Backend only: [Stripe test tokens](https://docs.stripe.com/testing) such as `tok_visa` exercise steps 3–4
      without a device.

## Sources

- [Google Pay API — tutorial, tokenization and processor table](https://developers.google.com/pay/api/android/guides/tutorial#tokenization)
- [Stripe — Apple Pay (iOS)](https://docs.stripe.com/apple-pay?platform=ios)
- [Stripe — Google Pay (Android)](https://docs.stripe.com/google-pay?platform=android)
- [Stripe API — PaymentMethods](https://docs.stripe.com/api/payment_methods/create),
  [PaymentIntents](https://docs.stripe.com/api/payment_intents/create), [Tokens](https://docs.stripe.com/api/tokens)
- [stripe-ios — Apple Pay token request](https://github.com/stripe/stripe-ios/blob/master/StripePayments/StripePayments/Source/API%20Bindings/STPAPIClient%2BApplePay.swift)
