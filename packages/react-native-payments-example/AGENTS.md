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
  flows/                         — one Maestro scenario per file (app_launch, can_make_payment_probe,
                                   sheet_opens_on_show, dismiss_abort_reject_state,
                                   shipping_listener_wiring_enabled/disabled, async_update_toggle_state,
                                   reset_new_request_state_transitions), run directly by `maestro test`
  subflows/                      — shared steps included via `runFlow` (dismiss_ios_sheet, show_request,
                                   launch_and_wait_for_probe), never run standalone
  readme.md                      — flow inventory, APP_ID table per target/platform, and the two documented
                                   E2E coverage gaps (iOS PassKit sheet sandboxes the app's own accessibility
                                   tree while presented; native-sheet-driven completion is out of reach on a
                                   simulator/emulator)
```

`apps/bare` and `apps/expo` are nested Yarn workspaces (root glob `packages/react-native-payments-example/apps/*`). They are
excluded from Lerna (`lerna.json` keeps `packages/*`), so they are never versioned or published.

## Key patterns

- The shared layer is consumed by package name: `main`/`module`/`types`/`react-native` all point at `src/index.ts`, so Metro
  bundles TypeScript sources directly — no build step.
- Both targets declare `@rnw-community/react-native-payments` as a direct dependency; native autolinking (React Native CLI and
  Expo) only scans the app target's own dependencies.
- Metro in both targets watches the monorepo root and resolves through app → package → root `node_modules`.
- The Expo native projects are generated (`expo prebuild`) and gitignored; the bare target keeps its `ios/`/`android/`
  directories checked in, with `node_modules` paths relative to the repository root (`../../../../node_modules` from
  `apps/bare/android`).
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
  log records the documented no-op instead of staying silent.
- The Maestro suite is one shared, parameterized flow set per scenario, not one per app target/platform: only the `APP_ID`
  env value and the connected device change between `apps/bare`/`apps/expo` and iOS/Android, and in-flow platform branching
  uses Maestro's `when: platform:` condition. Flows assert against the on-screen event log and flow-state/can-make-status
  labels, never native dialogs directly — except six iOS flows, which briefly assert against the PassKit sheet's own
  accessibility tree (via `subflows/dismiss_ios_sheet.yaml`) purely to dismiss it, since iOS blocks UI-test tooling from
  querying the app's own tree while that sheet is presented.
- `.github/workflows/ios-maestro.yml` and `android-maestro.yml` at the repo root run this suite per matrix target
  (`bare`/`expo`) on `[self-hosted, macOS, ARM64, macos-maestro]` / an equivalent Android runner, gated by a
  turbo-`--affected` check against this package and its two app workspaces. As of this writing the workflows are wired but
  queue rather than execute — the self-hosted fleet label is not yet registered (tracked separately) — so treat CI as
  configured, not as a currently green signal. The `maestro-e2e` agent skill (`.claude/skills/maestro-e2e`) documents how to
  drive and extend the suite locally.

## Commands

Target scripts live on this package and delegate to the nested workspaces: `ios:bare`, `android:bare`, `start:bare`,
`ios:expo`, `android:expo`, `start:expo`, `prebuild:expo`. `ts`, `lint`, `lint:fix` and `format` cover `src` only.
`e2e:ios:bare`, `e2e:ios:expo`, `e2e:android:bare`, `e2e:android:expo` each run `maestro test -e APP_ID=<target appId>
e2e/flows` against whichever simulator/emulator is currently booted — the app under test must already be built and
installed (`ios:bare`/`android:bare`/`ios:expo`/`android:expo`, or `prebuild:expo` first for the Expo native projects).

## Dependencies

`@rnw-community/react-native-payments` (workspace), `@rnw-community/shared` (workspace), `react`, `react-native`.

This is an example/demo package — no unit tests, no build, no publish. It does carry a real, runnable Maestro e2e suite
(`e2e/`) exercising the JS-observable half of the demo flow; see `e2e/readme.md` for the coverage boundary.
