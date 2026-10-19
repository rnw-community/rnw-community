# Roadmap

Open work for this package, as tracked GitHub issues, plus the W3C compliance checklist. The [landing
readme](../readme.md) links here instead of carrying its own TODO ledger.

## Open work

- [ ] Payment sheet GIFs for iOS and Android — [#469](https://github.com/rnw-community/rnw-community/issues/469),
      capture procedure below.
- [x] Shipping change events on Android through Google Pay callback intents —
      [#438](https://github.com/rnw-community/rnw-community/issues/438); coupons stay iOS-only, see below.
- Rewrite iOS to Swift — **deferred indefinitely**, decision recorded on
  [#442](https://github.com/rnw-community/rnw-community/issues/442).
- [ ] Rewrite Android to Kotlin — decided, low effort, tracked in
      [#442](https://github.com/rnw-community/rnw-community/issues/442).
- [x] Drop the `AppDelegate.h` PassKit import requirement — the pod links `PassKit` itself, tracked in
      [#442](https://github.com/rnw-community/rnw-community/issues/442).

## Docs

### Payment sheet GIFs — [#469](https://github.com/rnw-community/rnw-community/issues/469)

Capture procedure once the on-device Maestro fleet has capacity:

1. Add `startRecording: "sheet"` / `stopRecording` around the sheet-presenting step of the `sheet_opens_on_show.yaml`
   flow documented in [e2e/readme.md](../../react-native-payments-example/e2e/readme.md#flows).
2. Run `maestro test --test-output-dir "$MAESTRO_DEBUG_OUTPUT_DIRECTORY" -e APP_ID=... e2e/flows` from
   `packages/react-native-payments-example` (the `e2e:ios:bare` / `e2e:android:bare` / `:expo` scripts in
   `package.json` don't pass `--test-output-dir` today — add it for the capture run), with
   `MAESTRO_DEBUG_OUTPUT_DIRECTORY` set to an **absolute** path (e.g.
   `$(git rev-parse --show-toplevel)/packages/react-native-payments-example/artifacts/maestro-<platform>-<target>`) —
   a relative value resolves under the current directory, which is already `packages/react-native-payments-example`,
   and would nest a duplicate `packages/react-native-payments-example/` segment. This makes the `.mp4` land there
   instead of Maestro's default `~/.maestro/tests/<datetime>/`.
3. Convert with `ffmpeg -i sheet.mp4 -vf "fps=12,scale=320:-1" sheet.gif`.
4. Embed the result under [Screenshots](../readme.md#screenshots), replacing the placeholder.

## Native

### Android shipping change events — [#438](https://github.com/rnw-community/rnw-community/issues/438)

Done: `shippingaddresschange` / `shippingoptionchange` are delivered on Android through Google Pay's dynamic price
updates (`play-services-wallet` 20.0.0+): `show()` declares `callbackIntents` for the registered shipping listeners,
the library manifest declares `PaymentsCallbacksService`, and `updateWith` answers become `PaymentDataRequestUpdate`s —
see [guides/change-events.md](./guides/change-events.md#android). Outcome of the remaining spikes:

- **Coupons stay iOS-only.** Google Pay's Android `callbackIntents` are limited to `PAYMENT_AUTHORIZATION`,
  `SHIPPING_ADDRESS` and `SHIPPING_OPTION`; the `OFFER` intent (promo codes) exists on the web API only.
- **`paymentmethodchange` stays iOS-only.** There is no payment-method callback intent on Android.
- **In-sheet `complete()` / `retry()` remain future work.** Google Pay requires `PAYMENT_AUTHORIZATION` alongside the
  shipping intents; it is answered `SUCCESS` immediately today. Routing it to `PaymentResponse.complete()` /
  `retry()` would give Android an in-sheet authorization result, but changes when `show()` resolves.
- **On-device verification** with a signed-in Google account and a TEST-environment card is pending the Android
  Maestro suite ([#393](https://github.com/rnw-community/rnw-community/issues/393)).

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
- [x] **Android → Kotlin: done.** The former `PaymentsModule.java` (284 lines) was a single activity-result round
  trip, not a delegate protocol — `abort`/`complete`/`setActiveEvents`/`updatePaymentDetails` were no-ops that resolved
  immediately, no coupon codes, no in-sheet change events, no teardown state machine (the change events arrived later
  with #438). It is now `PaymentsModule.kt`,
  `PaymentsPackage.kt` and the two `android/src/*arch/PaymentsSpec.kt` variants, behaviour-identical (same method
  names, promise codes and messages); the newarch spec extends the codegen-generated Java `NativePaymentsSpec`
  directly, with no bridging shim. The library applies the `kotlin-android` plugin, resolving `kotlinVersion` from
  the consuming app's root project (React Native 0.86 apps already define it).
- **`AppDelegate.h` PassKit import: dropped.** `react-native-payments.podspec` declares
  `s.frameworks = "PassKit", "Contacts"`, linking the framework at the Pod target level, and the bare example's
  `AppDelegate.swift` (RN 0.86 community template) builds and passes the iOS Maestro suite without `import PassKit`.
  An `AppDelegate` import only matters when the app's own delegate code references PassKit symbols.

## W3C compliance checklist

- [x] [PaymentRequestUpdateEvent](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent) — JavaScript
      layer, iOS PassKit delivery and Android Google Pay callback delivery (shipping events) implemented (see
      [guides/change-events.md](./guides/change-events.md)); on-device
      verification is tracked in [#393](https://github.com/rnw-community/rnw-community/issues/393)
- [x] [PaymentMethodChangeEvent](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent) — JavaScript
      layer and iOS PassKit delivery implemented; Android stays silent because Google Pay has no payment-method
      callback intent; on-device verification is tracked in
      [#393](https://github.com/rnw-community/rnw-community/issues/393)
- [x] Implement [PaymentDetailsModifier](https://www.w3.org/TR/payment-request/#dom-paymentdetailsmodifier) — see
      [guides/modifiers.md](./guides/modifiers.md)
- [x] Improve and unify errors according to the spec — see [guides/errors.md](./guides/errors.md)
- [x] Implement [`hasEnrolledInstrument()`](https://www.w3.org/TR/payment-request/#hasenrolledinstrument-method) — see
      [api/payment-request.md](./api/payment-request.md); Android answers via Google Pay's
      `existingPaymentMethodRequired`, see [platforms/android.md](./platforms/android.md)
- [x] Implement the event-handler attributes (`onshippingaddresschange`, `onshippingoptionchange`,
      `onpaymentmethodchange`, `oncouponcodechange`) — see
      [guides/change-events.md](./guides/change-events.md#event-handler-attributes)
- [x] Implement [`PaymentOptions.shippingType`](https://www.w3.org/TR/payment-request/#dom-paymentoptions-shippingtype) as
      `methodData.data.shippingType` — see [platforms/ios.md](./platforms/ios.md); no-op on Android, see
      [platforms/android.md](./platforms/android.md)
- [x] Implement `PaymentResponse` `retry()` method — best-effort subset on iOS, documented no-op on Android; see
      [guides/retry.md](./guides/retry.md)
- [x] Implement `PaymentResponse` `toJSON()` method — see [api/payment-response.md](./api/payment-response.md)

## Related

- Epic: [#372](https://github.com/rnw-community/rnw-community/issues/372) — react-native-payments revival
- Docs Oasis: [#467](https://github.com/rnw-community/rnw-community/issues/467) — documentation platform umbrella
