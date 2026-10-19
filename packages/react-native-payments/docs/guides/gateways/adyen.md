# Adyen

Charge Apple Pay and Google Pay through [Adyen](https://docs.adyen.com/)'s API-only integration. Adyen takes both
wallet tokens directly in one Checkout API `/payments` request, so there is no separate token-exchange step.

## Values

| Value | Where | Source | Verified |
| --- | --- | --- | --- |
| `gateway: 'adyen'` | `gatewayConfig` | [Google Pay tutorial — Adyen row](https://developers.google.com/pay/api/android/guides/tutorial#tokenization), [Adyen — Google Pay](https://docs.adyen.com/payment-methods/google-pay/) | 2026-10-16 |
| `gatewayMerchantId`: your Adyen merchant account name (or company account name) | `gatewayConfig` | [Adyen — Google Pay](https://docs.adyen.com/payment-methods/google-pay/) | 2026-10-16 |
| Merchant ID with your **own** Apple Pay certificate, CSR downloaded from the Customer Area | `merchantIdentifier` | [Adyen — Apple Pay certificate (iOS)](https://docs.adyen.com/payment-methods/apple-pay/apple-pay-certificate/ios) | 2026-10-16 |
| `POST https://checkout-test.adyen.com/v72/payments`, `X-API-Key` header | backend | [Adyen Checkout API reference](https://docs.adyen.com/api-explorer/Checkout/latest/overview) | 2026-10-16 |
| `paymentMethod: { type: 'googlepay', googlePayToken }` | backend | [Adyen — Google Pay API-only](https://docs.adyen.com/payment-methods/google-pay/api-only/) | 2026-10-16 |
| `paymentMethod: { type: 'applepay', applePayToken }`, `applePayToken` = base64 of the stringified `paymentData` | backend | [Adyen — Apple Pay API-only](https://docs.adyen.com/payment-methods/apple-pay/api-only/) | 2026-10-16 |

The Google Pay API-only page requires Checkout API v67 or later; v72 is the latest version listed in the API
reference on the verification date.

## 1. Account setup

- **Apple Pay** — mobile apps must use their own Apple Pay certificate; Adyen's shared certificate is web-only. In the
  Customer Area go to **Developers › API credentials ›** your web service user **› Wallet payment methods › Apple
  Pay › Add › Use your own certificate**, enter the merchant ID, download the CSR, create the Apple Pay Payment
  Processing Certificate from it in the Apple Developer portal and upload it back. Adyen asks for separate merchant
  IDs for test and live (it suggests `merchant.com.adyen.<merchantAccount>.test`). In-app payments need no merchant
  session validation.
  Live Apple Pay payments need the **API Clientside Encryption Payments** role on the API credential.
- **Google Pay** — nothing extra for `TEST`. Before going live, complete Google's production access request with the
  **Gateway** integration type.

## 2. Method data

```ts
import { createApplePayMethodData, createGooglePayMethodData } from '@rnw-community/react-native-payments';

const methodData = [
    createApplePayMethodData({
        merchantIdentifier: 'merchant.com.adyen.YourMerchantAccount.test',
        countryCode: 'NL',
        currencyCode: 'EUR',
    }),
    createGooglePayMethodData({
        countryCode: 'NL',
        currencyCode: 'EUR',
        gatewayConfig: { gateway: 'adyen', gatewayMerchantId: 'YourMerchantAccount' },
    }),
];
```

## 3. Read the token

- **Android** — `response.details.androidPayToken.rawToken`, the Google Pay encrypted envelope string. Forward it
  unchanged; it becomes `googlePayToken`.
- **iOS** — `JSON.stringify(response.details.applePayToken.paymentData)`. Base64-encode it (on the device or on
  your backend); the result becomes `applePayToken`.

The [shared flow](./index.md#the-flow-every-recipe-shares) shows the client code for both.

## 4. Backend

1. `POST https://checkout-test.adyen.com/v72/payments` with the `X-API-Key` header and:
    - `merchantAccount`, `reference`, `amount: { currency, value }` (minor units, so `'10.00'` EUR is `1000`);
    - Google Pay: `paymentMethod: { type: 'googlepay', googlePayToken: <rawToken> }`;
    - Apple Pay: `paymentMethod: { type: 'applepay', applePayToken: <base64 of the paymentData JSON> }`.
2. `resultCode: 'Authorised'` maps to `PaymentComplete.SUCCESS`. A response with an `action` (`redirect` or
   `threeDS2`) needs 3-D Secure handling, which this package cannot present — include `browserInfo` and
   `returnUrl` only if you handle that action yourself, otherwise treat it as a failure.
3. Live payments use your account's live prefix:
   `https://{PREFIX}-checkout-live.adyenpayments.com/checkout/v72/payments`.

## 5. Sandbox checklist

- [ ] Google Pay: `environment` left at `TEST` and `gateway: 'adyen'` (not `example`) so the token can be
      authorised. Join [Google's test card suite](https://developers.google.com/pay/api/android/guides/resources/test-card-suite)
      — its cards map to Adyen test cards — or add a real card, which is mapped to an Adyen test card of the same
      brand and never charged.
- [ ] Google Pay: 3-D Secure 2 test flows need American Express or Discover cards.
- [ ] Apple Pay: test merchant ID with its own Adyen-uploaded certificate, and an
      [App Store Connect sandbox tester](https://developer.apple.com/apple-pay/sandbox-testing/) signed in on the
      device with an Apple test card in Wallet.
- [ ] The payment appears in the Customer Area under **Payments › Payment list**.

## Sources

- [Google Pay API — tutorial, tokenization and processor table](https://developers.google.com/pay/api/android/guides/tutorial#tokenization)
- [Adyen — Google Pay](https://docs.adyen.com/payment-methods/google-pay/),
  [Google Pay API-only](https://docs.adyen.com/payment-methods/google-pay/api-only/)
- [Adyen — Apple Pay API-only](https://docs.adyen.com/payment-methods/apple-pay/api-only/),
  [Apple Pay certificate](https://docs.adyen.com/payment-methods/apple-pay/apple-pay-certificate/),
  [iOS certificate steps](https://docs.adyen.com/payment-methods/apple-pay/apple-pay-certificate/ios)
- [Adyen Checkout API reference](https://docs.adyen.com/api-explorer/Checkout/latest/overview)
- [Apple Pay sandbox testing](https://developer.apple.com/apple-pay/sandbox-testing/)
