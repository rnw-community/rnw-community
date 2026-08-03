# Roadmap

Implementation notes for the open work items linked from [readme.md](./readme.md#todo). Each section maps to one
tracked GitHub issue; the readme keeps a one-line pointer, the detail lives here.

## Docs

### Payment sheet GIFs — [#469](https://github.com/rnw-community/rnw-community/issues/469)

Capture procedure once the on-device Maestro fleet has capacity:

1. Add `startRecording: "sheet"` / `stopRecording` around the sheet-presenting step of the `sheet_opens_on_show.yaml`
   flow documented in [e2e/readme.md](../react-native-payments-example/e2e/readme.md#flows).
2. Run `yarn workspace @rnw-community/react-native-payments-example e2e:ios:bare` / `e2e:android:bare` (or the
   `:expo` targets) with `MAESTRO_DEBUG_OUTPUT_DIRECTORY` set the same way the `ios-maestro.yml` /
   `android-maestro.yml` CI workflows set it
   (`packages/react-native-payments-example/artifacts/maestro-<platform>-<target>`), so the `.mp4` lands next to the
   other Maestro artifacts.
3. Convert with `ffmpeg -i sheet.mp4 -vf "fps=12,scale=320:-1" sheet.gif`.
4. Embed the result under [Screenshots](./readme.md#screenshots), replacing the placeholder.

## Native

### Android shipping options and coupon support — [#438](https://github.com/rnw-community/rnw-community/issues/438)

Google Pay's `loadPaymentData` supports dynamic price updates via `callbackIntents`
(`SHIPPING_ADDRESS`, `SHIPPING_OPTION`) and `PaymentDataCallbacks`, meaning `shippingaddresschange` /
`shippingoptionchange` could fire on Android through the same `updateWith` contract iOS already uses. Coupons are
a separate spike: investigate the Google Pay offer/promo surface, documenting the outcome either way (`couponcodechange`
would stay iOS-only if unsupported).

### Native modernization — [#442](https://github.com/rnw-community/rnw-community/issues/442)

Spike findings (decision recorded on the issue):

- **iOS → Swift: deferred indefinitely.** `Payments.mm`/`Payments.h` (1079 + 24 lines, ObjC++) implement a hardened
  PassKit delegate lifecycle — per-event pending-completion tracking with superseded-event detection, a teardown
  state machine invoked from five call sites, iOS 15+ conditional coupon-code support, and ~30 delegate
  callbacks/helpers. Codegen has no Swift TurboModule support today, so a Swift rewrite would sit behind an
  Objective-C++ spec surface anyway — it adds a bridging layer without removing the interop this module already has,
  while asking to re-verify ~1100 lines of delegate state whose regressions are silent runtime sheet hangs, not
  compile errors. Effort: L. Risk: high. Revisit only as part of an Expo Modules API spike (see #445), not as a
  standalone plain-Swift TurboModule rewrite.
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
