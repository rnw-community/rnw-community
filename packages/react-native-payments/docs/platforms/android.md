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

This package's own `android/build.gradle` depends on `com.google.android.gms:play-services-wallet:18.0.0` — match
or exceed that in your application if you pin the wallet dependency yourself:

```groovy
dependencies {
    // The version of react-native is set by the React Native Gradle Plugin
    implementation("com.facebook.react:react-android")

    implementation 'com.google.android.gms:play-services-wallet:18.0.0'
}
```

## Capabilities

- `environment` (`EnvironmentEnum`) selects the Google Pay environment for the payment; see
  [api/environment-enum.md](../api/environment-enum.md).
- `totalPriceStatus` describes how the total price will change: `'FINAL'` (default) or `'ESTIMATED'`. A zero total
  amount (`'0.00'`) is valid per the W3C spec. `'NOT_CURRENTLY_KNOWN'` is still accepted by the type for backwards compatibility,
  but Google's current `TransactionInfo` reference only lists `'ESTIMATED'` and `'FINAL'` — for a charge whose amount
  is not known at checkout, use a [merchant-initiated transaction](#merchant-initiated-transactions) instead. See
  [TransactionInfo](https://developers.google.com/pay/api/android/reference/request-objects#TransactionInfo).
- `checkoutOption` selects the payment sheet submit button: `'DEFAULT'`, `'COMPLETE_IMMEDIATE_PURCHASE'` ("Pay now")
  or `'CONTINUE_TO_REVIEW'` ("Review Order"). Google Pay only allows `'COMPLETE_IMMEDIATE_PURCHASE'` together with the
  `'FINAL'` `totalPriceStatus`, so the constructor throws on any other combination.
- `transactionId` correlates the payment attempt in Google Pay transaction events.
- `allowedAuthMethods` (`AndroidAllowedAuthMethodsEnum`) defaults to both `PAN_ONLY` and `CRYPTOGRAM_3DS` when
  omitted. See [api/android-payment-method-data.md](../api/android-payment-method-data.md).
- `canMakePayment()` calls Google Pay's `isReadyToPay` against the `environment` set in `methodData.data`, the same
  environment `show()` opens the sheet in.
- `hasEnrolledInstrument()` calls Google Pay's `isReadyToPay` with `existingPaymentMethodRequired: true`. See
  [Known deviations](#known-deviations).

### Merchant-initiated transactions

For pre-orders, bookings, subscriptions and automatic reloads, set exactly one of `deferredTransactionInfo`,
`recurringTransactionInfo` or `automaticReloadTransactionInfo` on the Android `methodData.data`. The package sends it in
place of `transactionInfo`, with `details.total` as the `immediateTotalPrice` due today (`'0.00'` allowed) and
`currencyCode`, `countryCode` (required) and `transactionId` taken from the method data. It cannot be combined with
`checkoutOption` or `totalPriceStatus`. See
[api/android-merchant-initiated-transaction-info.md](../api/android-merchant-initiated-transaction-info.md).

## Known deviations

- **`canMakePayment()`/`hasEnrolledInstrument()`/`show()` resolve gracefully without Google Play
  Services.** `GoogleApiAvailability.isGooglePlayServicesAvailable()` is checked before the chained
  `isReadyToPay()`/`loadPaymentData()` call that actually reaches into Play services —
  `Wallet.getPaymentsClient(...)` itself never fails on its own. On a device where Play Services is
  missing or invalid, Play Services would otherwise turn that chained call into a blocking,
  unrecoverable system dialog over the whole screen instead of failing the promise; the guard
  reports AndroidPay as unsupported instead, so `canMakePayment()`/`hasEnrolledInstrument()`
  resolve `false` and `show()` rejects like any other unsupported configuration.
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
