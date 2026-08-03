# Android quickstart

The fastest path to a Google Pay sheet. See [Platforms — Android](../platforms/android.md) for the full setup
story (capabilities, deviations, dependency version).

1. Create a [Google developer account](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en).
2. Follow Google's [Google Pay API for Android setup guide](https://developers.google.com/pay/api/android/guides/setup).
3. Depend on `com.google.android.gms:play-services-wallet:19.2.0` or newer — see
   [Platforms — Android](../platforms/android.md#native-setup) for the Gradle snippet.
4. Add your test Google account to the
   [Google Pay API Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data?pli=1).
5. Construct a `PaymentRequest` with `PaymentMethodNameEnum.AndroidPay` method data (`supportedNetworks`,
   `environment`, `countryCode`, `currencyCode`, `gatewayConfig`) and call `show()` — see the
   [readme quickstart](../../readme.md#quickstart) for the full snippet.

`canMakePayment()` on Android always checks against `EnvironmentEnum.Test` regardless of the `environment` set
on `methodData.data` — set the real `environment` for `show()` regardless of what `canMakePayment()` reported.
See [Platforms — Android](../platforms/android.md#known-deviations).
