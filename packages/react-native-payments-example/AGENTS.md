# @rnw-community/react-native-payments-example

Private. Single example package for the Payment Request API library, with one shared screen layer and two app targets.

## Layout

```
src/
  index.ts                       — exports `App`
  component/                     — app.tsx, demo-status.tsx, request-builder-form.tsx, demo-actions.tsx,
                                   event-log-view.tsx, switch-row.tsx, text-input-row.tsx
  constant/                      — default-request-options.ts, demo-style.ts, demo-currency.ts,
                                   shipping-surcharge-value.ts, async-update-latency-ms.ts
  hook/                          — use-event-log.ts, use-request-options.ts, use-payment-demo.ts
  interface/                     — request-options.interface.ts, request-options-state.interface.ts,
                                   event-log.interface.ts, event-log-entry.interface.ts, payment-demo.interface.ts
  type/                          — request-option-toggle.type.ts
  payment/                       — create-payment-request.ts, create-demo-request.ts, get-payment-details.ts,
                                   get-details-update.ts, get-updated-total-value.ts, attach-change-listeners.ts,
                                   create-change-event-listener.ts, get-change-event-summary.ts,
                                   answer-change-event.ts, show-payment-request.ts, abort-payment-request.ts,
                                   complete-payment-response.ts, check-can-make-payment.ts, method-data/
  util/                          — get-payment-name.ts, format-log-message.ts
apps/
  bare/                          — @rnw-community/react-native-payments-example-bare (React Native CLI)
    index.js, app.json, babel.config.js, metro.config.js, ios/, android/
  expo/                          — @rnw-community/react-native-payments-example-expo (Expo)
    index.js, app.json, babel.config.js, metro.config.js, assets/
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
  drops it so the next `action-show` builds a fresh request from the current builder options.
- Change-event listeners are attached per request in `attach-change-listeners.ts`: `paymentmethodchange` always,
  the shipping pair when `requestShipping` is on, `couponcodechange` only on iOS with the coupon toggle on. On Android the
  log records the documented no-op instead of staying silent.

## Commands

Target scripts live on this package and delegate to the nested workspaces: `ios:bare`, `android:bare`, `start:bare`,
`ios:expo`, `android:expo`, `start:expo`, `prebuild:expo`. `ts`, `lint`, `lint:fix` and `format` cover `src` only.

## Dependencies

`@rnw-community/react-native-payments` (workspace), `@rnw-community/shared` (workspace), `react`, `react-native`.

This is an example/demo package — no tests, no build, no publish.
