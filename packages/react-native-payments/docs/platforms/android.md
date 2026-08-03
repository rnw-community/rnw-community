# Android (Google Pay)

Setup, capabilities, and how this package's `PaymentRequest` maps onto the Google Pay API.

## Setup

- Create a [Google developer account](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).
- Follow [this guide](https://developers.google.com/pay/api/android/guides/setup) to set up the Google Pay API in
  your application.
- [Google payments tutorial](https://developers.google.com/pay/api/android/guides/tutorial).
- [Google brand guidelines](https://developers.google.com/pay/api/android/guides/brand-guidelines).
- Your Google account used for testing must be added to the
  [Google Pay API Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data?pli=1).

### Native setup

Use `19.0.0+` of Google Play Services in your application:

```groovy
dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    implementation 'com.google.android.gms:play-services-wallet:19.2.0'
}
```

## Capabilities

- `environment` (`EnvironmentEnum`) selects the Google Pay environment for the payment; see
  [api/environment-enum.md](../api/environment-enum.md).
- `totalPriceStatus` describes how the total price will change: `'FINAL'` (default), `'ESTIMATED'` or
  `'NOT_CURRENTLY_KNOWN'`. A zero total amount (`'0.00'`) is valid per the W3C spec and can be combined with a
  non-final status when the price is not known upfront. See
  [TransactionInfo](https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo).
- `checkoutOption` selects the payment sheet submit behavior: `'DEFAULT'` or `'COMPLETE_IMMEDIATE_PURCHASE'`.
  Google Pay only allows `'COMPLETE_IMMEDIATE_PURCHASE'` together with the `'FINAL'` `totalPriceStatus`, so the
  constructor throws on any other combination.
- `transactionId` correlates the payment attempt in Google Pay transaction events.
- `allowedAuthMethods` (`AndroidAllowedAuthMethodsEnum`) defaults to both `PAN_ONLY` and `CRYPTOGRAM_3DS` when
  omitted. See [api/android-payment-method-data.md](../api/android-payment-method-data.md).
- `canMakePayment()` calls Google Pay's `isReadyToPay` and always checks against `EnvironmentEnum.Test` regardless
  of the `environment` set in `methodData.data`, mirroring the W3C surface (`canMakePayment` only answers "is a
  payment handler available", not "is this specific environment reachable"). See
  [#259](https://github.com/rnw-community/rnw-community/issues/259).
- `hasEnrolledInstrument()` calls Google Pay's `isReadyToPay` with `existingPaymentMethodRequired: true`. See
  [Known deviations](#known-deviations).

## Known deviations

- **Change events are a no-op.** Google Pay renders its sheet in its own activity and never asks the app for an
  in-sheet update, so `addEventListener` can be called but a registered listener never fires on Android. See
  [guides/change-events.md](../guides/change-events.md).
- **`complete()` and `abort()` have no effect** — an artifact of the Google Pay activity-result flow, which has
  no in-sheet dismiss/complete call to make.
- **`retry()` is a documented no-op.** It resolves without any visual effect, consistent with the `complete()`/
  `abort()` no-op boundary above — Google Pay's sheet is a separate activity with no in-sheet update mechanism at
  all. See [guides/retry.md](../guides/retry.md).
- **`methodData.data.shippingType` is a no-op.** Google Pay has no `PKShippingType`-equivalent concept; the value
  is validated but not forwarded to native.
- **`hasEnrolledInstrument()` is an optimistic signal, not a guarantee.** `isReadyToPay` with
  `existingPaymentMethodRequired: true` is the closest reachable equivalent of "an instrument is enrolled" the API
  exposes; Google documents this as best-effort and it can still resolve `true` without a fully usable card in
  some configurations.
- **Shipping options and coupon support are not yet implemented** — tracked in
  [#438](https://github.com/rnw-community/rnw-community/issues/438), spike notes in
  [roadmap.md](../roadmap.md#android-shipping-options-and-coupon-support--438).
