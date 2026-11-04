# @rnw-community/react-native-payments-example

Private. Single example package for the Payment Request API library, with one shared screen layer and two app targets.

## Layout

```text
src/
  index.ts                       — exports `App`
  component/                     — app.tsx, demo-status.tsx, request-builder-form.tsx, demo-actions.tsx,
                                   event-log-view.tsx, switch-row.tsx, text-input-row.tsx
  constant/                      — default-request-options.ts, demo-style.ts, demo-currency.ts,
                                   demo-shipping-options.ts, default-shipping-option-id.ts,
                                   shipping-surcharge-value.ts, zero-amount-value.ts, async-update-latency-ms.ts
  hook/                          — use-event-log.ts, use-request-options.ts, use-payment-demo.ts
  interface/                     — request-options.interface.ts, request-options-state.interface.ts,
                                   event-log.interface.ts, event-log-entry.interface.ts, payment-demo.interface.ts
  type/                          — request-option-toggle.type.ts
  payment/                       — create-payment-request.ts, create-demo-request.ts, get-payment-details.ts,
                                   get-details-update.ts, get-shipping-options.ts, get-updated-total-value.ts,
                                   attach-change-listeners.ts, create-change-event-listener.ts,
                                   get-change-event-summary.ts, answer-change-event.ts, show-payment-request.ts,
                                   abort-payment-request.ts, complete-payment-response.ts, check-can-make-payment.ts,
                                   method-data/
  util/                          — get-payment-name.ts, format-log-message.ts, create-flow-state-guard.ts
apps/
  bare/                          — @rnw-community/react-native-payments-example-bare (React Native CLI)
    index.js, app.json, babel.config.js, metro.config.js, ios/, android/
  expo/                          — @rnw-community/react-native-payments-example-expo (Expo)
    index.js, app.json, babel.config.js, metro.config.js, assets/
e2e/
  readme.md                      — test inventory, APP_ID table per target/platform, and the two documented
                                   E2E coverage gaps (iOS PassKit sheet sandboxes the app's own accessibility
                                   tree while presented; native-sheet-driven completion is out of reach on a
                                   simulator/emulator)
```

`apps/bare` and `apps/expo` are nested pnpm workspaces (root glob `packages/react-native-payments-example/apps/*` in
`pnpm-workspace.yaml`). They are excluded from Lerna (`lerna.json` keeps `packages/*`), so they are never versioned or
published.

## Key patterns

- The shared layer is consumed by package name: `main`/`module`/`types`/`react-native` all point at `src/index.ts`, so Metro
  bundles TypeScript sources directly — no build step.
- Both targets declare `@rnw-community/react-native-payments` as a direct dependency; native autolinking (React Native CLI and
  Expo) only scans the app target's own dependencies.
- Metro in both targets watches the monorepo root and resolves through app → package → root `node_modules`.
- The Expo native projects are generated (`expo prebuild`) and gitignored; the bare target keeps its `ios/`/`android/`
  directories checked in. Their Gradle config never counts `../` levels to a hoisted `node_modules`: `settings.gradle` and
  `android/app/build.gradle` locate `react-native`, `@react-native/gradle-plugin`, `@react-native/codegen` and
  `hermes-compiler` by running `node --print require.resolve(...)` from the Gradle root, which resolves correctly under
  pnpm's isolated store (nothing is hoisted to the repository root) and under any other layout. `REACT_NATIVE_PATH` in the
  Xcode project is rewritten by `react_native_post_install` at `pod install` time, so the checked-in value is not
  load-bearing.
- The Expo target is intentionally router-free: a single `registerRootComponent(App)` entry, so it carries only `expo`,
  `expo-system-ui`, `@expo/metro-runtime`, `react-native-web` and `react-dom` on top of the shared layer. Apple Pay
  entitlements come from the `@rnw-community/react-native-payments/app.plugin` entry in `app.json`.
- The screen is e2e-driven: every control and status carries a stable `testID` and every lifecycle moment is appended to the
  on-screen event log through `formatLogMessage`, so an end-to-end suite asserts on log rows instead of native dialogs. The
  full inventory lives in the `Test IDs` section of `readme.md` — keep it in sync with the components.
- `usePaymentDemo` keeps the `PaymentRequest` in a ref: `action-show` reuses it, which is what surfaces the single-use
  behaviour (the second `show()` rejects with `InvalidStateError` and the rejection lands in the log), and `action-reset`
  drops it so the next `action-show` builds a fresh request from the current builder options. `action-reset` also bumps a
  generation counter that `createFlowStateGuard` captures at show time, so the outcome of a discarded request can no longer
  overwrite the flow state of the current one — it is logged as `show settled after reset` instead.
- `getDetailsUpdate` answers change events with the request's own configuration: `shippingOptions` and the shipping share of
  the total only exist when `requestShipping` is on, `displayItems` only when `showDisplayItems` is on, and the selected
  option is read from `paymentRequest.shippingOption` (kept current by the event payload) so an answer never overrides the
  user's shipping choice or charges another option's amount. `demo-shipping-options.ts` is the single source for both the
  initial details and the updates.
- Change-event listeners are attached per request in `attach-change-listeners.ts`: `paymentmethodchange` always,
  the shipping pair when `requestShipping` is on, `couponcodechange` only on iOS with the coupon toggle on. On Android the
  log records that only the shipping pair is delivered (Google Pay callback intents), so a silent
  `paymentmethodchange` there is expected.
- The e2e suite lives in the repo root `e2e/tests/payments/` (one `<flow>.e2e.ts` per scenario, shared steps in
  `e2e/support/payments.ts`). It is one shared, parameterized test set per scenario, not one per app target/platform:
  only the `E2E_APP_ID`/`E2E_APP_PATH` values and the leased device change between `apps/bare`/`apps/expo` and
  iOS/Android, and platform branching reads `ctx.platform`. Tests assert against the on-screen event log and
  flow-state/can-make-status labels, never native dialogs directly — except the iOS branches, which briefly assert
  against the PassKit sheet's own accessibility tree (`dismissIosSheet`) purely to dismiss it, since iOS blocks UI-test
  tooling from querying the app's own tree while that sheet is presented.
- `.github/workflows/ios-e2e.yml` ("iOS E2E") and `android-e2e.yml` ("Android E2E") at the repo root run this
  suite per target (`payments-bare`/`payments-expo`) on devices leased from the simlock farm, gated by a
  turbo-`--affected` check against every target's app workspace. iOS leases a full, unslimmed simulator (PassKit);
  Android runs on the API 34 `aosp_atd` image, which has no Google Play services. See the root `AGENTS.md`
  "Mobile CI (E2E)" section.

## Commands

Target scripts live on this package and delegate to the nested workspaces: `ios:bare`, `android:bare`, `start:bare`,
`ios:expo`, `android:expo`, `start:expo`, `prebuild:expo`. `ts`, `lint`, `lint:fix` and `format` cover `src` only.
The e2e tests run from the repo root `e2e/` project (`cd e2e && npm ci`, then mobile-ci's `fetch-e2e-simlock.sh v4.10.2 .` for the device provider, then `npx e2e run --target ios|android` with
`SIMLOCK_URL`, `SIMLOCK_TOKEN`, `E2E_APP_ID`, `E2E_APP_PATH` and `E2E_TARGET=payments-bare` set) against a built
`.app`/`.apk`; see `e2e/readme.md`.

## Dependencies

`@rnw-community/react-native-payments` (workspace), `@rnw-community/shared` (workspace), `react`, `react-native`.

This is an example/demo package — no unit tests, no build, no publish. Its e2e suite (the repo root
`e2e/tests/payments`) exercises the JS-observable half of the demo flow; see `e2e/readme.md` for the coverage boundary.
