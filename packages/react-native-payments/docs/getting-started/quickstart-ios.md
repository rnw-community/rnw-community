# iOS quickstart

The fastest path to an Apple Pay sheet. See [Platforms — iOS](../platforms/ios.md) for the full setup story
(capabilities, deviations, native code snippets).

1. Create an [Apple developer account](https://developer.apple.com/programs/enroll/) and a merchant ID.
2. Follow Apple's [Apple Pay configuration guide](https://developer.apple.com/library/archive/ApplePay_Guide/Configuration.html)
   to enable the capability and register the merchant ID.
3. Import `PassKit` in your `AppDelegate` — see [Platforms — iOS](../platforms/ios.md#native-setup) for the
   Objective-C and Swift snippets.
4. Construct a `PaymentRequest` with `PaymentMethodNameEnum.ApplePay` method data (`merchantIdentifier`,
   `supportedNetworks`, `countryCode`, `currencyCode`) and call `show()` — see the
   [readme quickstart](../../readme.md#quickstart) for the full snippet.

`merchantIdentifier` passed to `methodData.data` must exactly match the merchant ID declared in the app's
`com.apple.developer.in-app-payments` entitlement, or the sheet fails with a merchant/entitlement error — see
[Troubleshooting](../guides/troubleshooting.md).
