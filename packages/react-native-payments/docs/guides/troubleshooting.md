# Troubleshooting

Every entry below traces back to a real report against this package or its native tooling.

**`pod install` / Gradle fails right after adding the package.** Autolinking (RN 0.60+) should pick this module up
without a manual link step. A stale `Podfile.lock`/`Pods` directory or an old Node version behind the CocoaPods
autolinking script are the most common causes of a cryptic `Podfile` parse error — matching the Node version
pinned in [`.nvmrc`](../../.nvmrc) resolved it in
[#163](https://github.com/rnw-community/rnw-community/issues/163). Delete `ios/Pods`, `ios/Podfile.lock` and
re-run `pod install` before assuming the package itself is at fault.

**`UnsupportedTypeAnnotationParserError: TypeScript type annotation 'TSObjectKeyword' is unsupported in
NativeModule specs` during Gradle/Pod codegen, or Gradle's `PaymentsModule is not abstract and does not override
abstract method show(...)`.** Both are react-native-codegen/TurboModule spec mismatches between the installed
package version and the installed `react-native` version — see
[#238](https://github.com/rnw-community/rnw-community/issues/238) and
[#174](https://github.com/rnw-community/rnw-community/issues/174). Upgrade `@rnw-community/react-native-payments`
and `react-native` together rather than pinning one against a much newer or older other; a leftover generated
`PaymentsSpec.java`/`Payments.mm` codegen artifact from before the bump is a common secondary cause — see the
Metro vs native rebuild entry below.

**Apple Pay sheet never appears, or fails with a merchant/entitlement error.** The `merchantIdentifier` passed to
`methodData.data` must exactly match a merchant ID declared in the app's `com.apple.developer.in-app-payments`
entitlement. For a bare RN app, add it in Xcode's Signing & Capabilities; for Expo, use the `merchantIdentifier`
config plugin option — single string or array — documented in [platforms/expo.md](./../platforms/expo.md) and
re-run `expo prebuild --clean` after changing it. If the sheet still won't open on a physical device while
running from Metro in `DEV`, first check `merchantCapabilities`/`supportedNetworks` are set explicitly on
`methodData.data` — a worked configuration that resolved this for other users is in
[#234](https://github.com/rnw-community/rnw-community/issues/234).

**Apple Pay works in the simulator but the token is unusable, or the reverse.** The simulator renders the real
PassKit sheet UI, but `paymentResponse.details.applePayToken` from it is not valid production payment data —
Apple Pay must be verified end-to-end on a physical device signed into an Apple ID with at least one provisioned
card before shipping. Conversely, a device-only failure usually means the merchant ID/capabilities/entitlement
above, not the JS integration.

**Google Pay `canMakePayment()` returns `true` in `EnvironmentEnum.Production` you never tested.** This is by
design, not a bug: `canMakePayment()` on Android always checks against `ENVIRONMENT_TEST` regardless of the
`environment` set in `methodData.data`, mirroring the W3C surface (`canMakePayment` only answers "is a payment
handler available", not "is this specific environment reachable") — see
[#259](https://github.com/rnw-community/rnw-community/issues/259). Set the real `environment` for `show()`
regardless of what `canMakePayment()` reported, and use accounts from the
[Test Cards Allowlist](https://groups.google.com/g/googlepay-test-mode-stub-data) documented in
[platforms/android.md](./../platforms/android.md) when testing.

**Metro reload doesn't pick up a fix, or the app red-screens / white-screens after bumping `react-native`.** A
JS-only Metro reload never re-runs native linking or codegen — after bumping `react-native`, this package's
major version (see [migrate-from-v2.md](./migrate-from-v2.md)), or Xcode/Gradle toolchain versions, do a full
native rebuild rather than a Fast Refresh: delete `ios/Pods`, `ios/build`, `android/build`, `android/.cxx`, then
`pod install` and rebuild from Xcode/Gradle. A patch-version-only `react-native` bump that broke both platforms
with no JS-visible error, as reported in [#185](https://github.com/rnw-community/rnw-community/issues/185), is
exactly this class of stale-native-artifact failure, not a JS regression.

**New Architecture / bridgeless.** The package ships one TurboModule `Spec` consumed identically on the old
architecture, the New Architecture and bridgeless — `getNativePaymentsEventEmitter()` resolves through the same
module handle on all three, so switching `newArchEnabled` does not by itself require touching this package's
integration (see [architecture.md](./../architecture.md)). This `null`-when-unimplemented guard only covers the
*optional* change-event contract (`setActiveEvents`/`updatePaymentDetails`/`addListener`/`removeListeners`)
degrading to the v2 no-events flow — it does **not** cover the required
`show(requestId, methodData, details)` call: a `v3` JS bundle still needs a rebuilt `v3` native binary, exactly
as [migrate-from-v2.md](./migrate-from-v2.md) describes, regardless of architecture. A build error mentioning
`TSObjectKeyword` or an abstract-method mismatch when New Architecture is enabled is the codegen version-skew
issue above, not a New Architecture incompatibility.

**Jest: `The package 'react-native-payments' doesn't seem to be linked` (originally reported as
`TurboModuleRegistry.getEnforcing(...): 'Payments' could not be found`).** Covered in
[testing.md](./testing.md) — mock `NativeModules.Payments` so the module resolves to a fake instead of falling
through to the linking-error proxy ([#227](https://github.com/rnw-community/rnw-community/issues/227)).
