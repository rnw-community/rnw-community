# Roadmap

Implementation notes for the open work items linked from [readme.md](./readme.md#todo). Each issue subsection maps to
one tracked GitHub issue; the readme keeps a one-line pointer, the detail lives here.

## Docs

### Payment sheet GIFs — [#469](https://github.com/rnw-community/rnw-community/issues/469)

Capture procedure once the on-device Maestro fleet has capacity:

1. Add `startRecording: "sheet"` / `stopRecording` around the sheet-presenting step of the `sheet_opens_on_show.yaml`
   flow documented in [e2e/readme.md](../react-native-payments-example/e2e/readme.md#flows).
2. Run `maestro test --test-output-dir "$MAESTRO_DEBUG_OUTPUT_DIRECTORY" -e APP_ID=... e2e/flows` from
   `packages/react-native-payments-example` (the `e2e:ios:bare` / `e2e:android:bare` / `:expo` scripts in
   `package.json` don't pass `--test-output-dir` today — add it for the capture run), with
   `MAESTRO_DEBUG_OUTPUT_DIRECTORY` set to an **absolute** path the same way `ios-maestro.yml` / `android-maestro.yml`
   do for their post-run screenshot/artifact upload (`${{ github.workspace }}/packages/react-native-payments-example/artifacts/maestro-<platform>-<target>`
   in CI; locally, `$(git rev-parse --show-toplevel)/packages/react-native-payments-example/artifacts/maestro-<platform>-<target>`) —
   a relative value resolves under the current directory, which is already `packages/react-native-payments-example`,
   and would nest a duplicate `packages/react-native-payments-example/` segment. This makes the `.mp4` land there
   instead of Maestro's default `~/.maestro/tests/<datetime>/`.
3. Convert with `ffmpeg -i sheet.mp4 -vf "fps=12,scale=320:-1" sheet.gif`.
4. Embed the result under [Screenshots](./readme.md#screenshots), replacing the placeholder.

## Native

### Android shipping options and coupon support — [#438](https://github.com/rnw-community/rnw-community/issues/438)

Google Pay's `loadPaymentData` supports dynamic price updates via `callbackIntents`
(`SHIPPING_ADDRESS`, `SHIPPING_OPTION`) and `PaymentDataCallbacks`, meaning `shippingaddresschange` /
`shippingoptionchange` could fire on Android and feed the same `updateWith` contract iOS already uses — but this is
new infrastructure, not a small tweak to the existing no-op: `AndroidManifest.xml` currently declares no services at
all, and `PaymentsModule.java`'s `setActiveEvents`/`updatePaymentDetails` resolve immediately without touching Google
Pay. Shipping on Android would require registering a `Service` extending `BasePaymentDataCallbacks` in the manifest
(with the `com.google.android.gms.permission.BIND_PAYMENTS_CALLBACK_SERVICE` permission and a
`com.google.android.gms.wallet.callback.PAYMENT_DATA_CALLBACKS` intent filter) that overrides
`onPaymentDataChanged(IntermediatePaymentData, OnCompleteListener<PaymentDataRequestUpdate>)` for the declared
`SHIPPING_ADDRESS`/`SHIPPING_OPTION` callback intents, adapting the `PaymentDataRequestUpdate` handed to that
listener into the existing `updatePaymentDetails` call so JS `updateWith` observes it the same way it does on iOS.
`onPaymentAuthorized` is a second override on that same `BasePaymentDataCallbacks` service — not a separate
mechanism — required only when `PAYMENT_AUTHORIZATION` is also declared in `callbackIntents` for in-sheet
authorization review, which is out of scope for the shipping/coupon work here. Coupons are a separate spike:
investigate the Google Pay offer/promo surface, documenting the outcome either way (`couponcodechange` would stay
iOS-only if unsupported).

### Native modernization — [#442](https://github.com/rnw-community/rnw-community/issues/442)

Spike findings (decision recorded on the issue):

- **iOS → Swift: deferred indefinitely.** `Payments.mm`/`Payments.h` (1079 + 24 lines, ObjC++) implement a hardened
  PassKit delegate lifecycle — per-event pending-completion tracking with superseded-event detection, a teardown
  state machine invoked from five call sites, iOS 15+ conditional coupon-code support, and ~30 delegate
  callbacks/helpers. Codegen (React Native 0.86.2, the version this monorepo is pinned to) has no Swift TurboModule
  support — it only emits Objective-C++ glue — so a Swift rewrite would still sit behind an Objective-C++ spec surface,
  adding a bridging layer without removing the interop this module already has, while asking to re-verify ~1100 lines
  of delegate state whose regressions are silent runtime sheet hangs, not compile errors. Effort: L. Risk: high.
  Revisit only as part of an Expo Modules API spike (see #445), not as a standalone plain-Swift TurboModule rewrite.
- **Android → Kotlin: do.** `PaymentsModule.java` (284 lines) is a single activity-result round trip, not a delegate
  protocol — `abort`/`complete`/`setActiveEvents`/`updatePaymentDetails` are no-ops that resolve immediately, no
  coupon codes, no in-sheet change events, no teardown state machine. The oldarch/newarch split already isolates the
  codegen boundary in one abstract spec file, so Kotlin interops with the generated `NativePaymentsSpec` without a
  bridging shim. Effort: S. Risk: low.
- **`AppDelegate.h` PassKit import: document + verify.** The regenerated bare example's `AppDelegate.swift` (RN
  0.86 community template) contains no `import PassKit`, and `react-native-payments.podspec` already declares
  `s.frameworks = "PassKit", "Contacts"`, linking the framework at the Pod target level — the readme's "add this
  import" instructions look like they predate that framework-level linking. Not yet build-verified; needs a
  `pod install` + build against both the ObjC and Swift `AppDelegate` templates before the readme instruction is
  dropped. Effort: XS.

## Related

- Epic: [#372](https://github.com/rnw-community/rnw-community/issues/372) — react-native-payments revival
- Docs Oasis: [#467](https://github.com/rnw-community/rnw-community/issues/467) — documentation platform umbrella
