# @rnw-community/react-native-payments-example

Private. Single example package for the Payment Request API library, with one shared screen layer and two app targets.

## Layout

```
src/
  index.ts                       — exports `App`
  component/                     — app.tsx, request-options-form.tsx, switch-row.tsx
  payment/                       — create-payment-request.ts, payment-details.ts, method-data/
  util/get-payment-name.ts
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

## Commands

Target scripts live on this package and delegate to the nested workspaces: `ios:bare`, `android:bare`, `start:bare`,
`ios:expo`, `android:expo`, `start:expo`, `prebuild:expo`. `ts`, `lint`, `lint:fix` and `format` cover `src` only.

## Dependencies

`@rnw-community/react-native-payments` (workspace), `@rnw-community/shared` (workspace), `react`, `react-native`.

This is an example/demo package — no tests, no build, no publish.
