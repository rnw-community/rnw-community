# @rnw-community/react-native-collapsible-header-example

Private. Single example package for the collapsible header library, with one shared screen layer and two app targets.
Mirrors the structure of `react-native-payments-example`.

## Layout

```text
src/
  index.ts                       — exports `App`
  component/                     — app.tsx (native stack + enableFreeze), header-demo-home-screen.tsx,
                                   header-demo-details-screen.tsx, header-demo-screen.tsx,
                                   header-demo-expanded-summary.tsx, header-demo-collapsed-summary.tsx,
                                   header-demo-actions.tsx, header-demo-list.tsx, header-demo-list-item.tsx,
                                   settings-demo-screen.tsx (navigation-chrome case: large title collapses into a
                                   compact title row between persistent icon buttons), settings-demo-actions.tsx,
                                   settings-demo-large-title.tsx, settings-demo-small-title.tsx,
                                   settings-demo-list.tsx, settings-demo-list-item.tsx
  constant/                      — header-demo-geometry.ts, header-demo-items.ts, header-demo-style.ts,
                                   settings-demo-items.ts, settings-demo-style.ts
  interface/                     — header-demo-item.interface.ts
  type/                          — header-demo-stack-param-list.type.ts
apps/
  bare/                          — @rnw-community/react-native-collapsible-header-example-bare (React Native CLI)
    index.js, app.json, babel.config.js (with react-native-worklets/plugin), metro.config.js; ios/ and android/
    are gitignored and generated locally
  expo/                          — @rnw-community/react-native-collapsible-header-example-expo (Expo)
    index.js, app.json, babel.config.js, metro.config.js, assets/; ios/ and android/ come from `expo prebuild`
e2e/
  flows/                         — app_launch, collapse_on_scroll, expand_on_scroll_back, snap_to_nearest_endpoint,
                                   freeze_preserves_collapsed_state, settings_header_collapses,
                                   settings_freeze_preserves_collapsed_state, run by `maestro test`
  subflows/                      — launch_header_demo (shared launch + first-frame wait), included via `runFlow`
  recording/                     — demo_capture.yaml and settings_capture.yaml, produce the readme demo videos
                                   (not assertion flows)
  readme.md                      — flow inventory, APP_ID table, and the accessibility-tree visibility semantics
```

## What the demo exercises

- `CollapsibleHeaderProvider` + `useCollapsibleHeaderScroll` — zero manual `scrollY` plumbing between the header and
  the `Animated.ScrollView`. Each screen mounts its OWN provider (`header-demo-home-screen.tsx` and
  `settings-demo-screen.tsx`); `app.tsx` deliberately mounts none, because one provider around the navigator would make
  the last-scrolled screen drive every header. Follow that shape when adding screens.
- `snap` — provider-driven snap to the nearest endpoint after partial scrolls.
- `stretchOnOverscroll` — header grows during negative overscroll.
- `useCollapsibleHeaderProgress` — the expanded badge scales down from the slot-facing progress shared value.
- Persistent content — the refresh action stays mounted across both transition layers.
- Accessibility switching — the Maestro suite asserts hidden-layer removal from the accessibility tree.
- Screen freeze — native-stack navigation with `enableFreeze(true)` + `freezeOnBlur`; returning to a frozen screen
  (Home or Settings) must keep the header collapsed (state derives purely from the shared scroll value; also covered
  by `collapsible-header-freeze.spec.tsx` in the library package via react-freeze).
- Navigation chrome — the Settings screen shows the second use case: a large title that collapses into a small
  centered title between persistent leading/trailing icon buttons, per the settings pages in suuudokuuu and budgie.

## CI coverage

Both Maestro workflows (`.github/workflows/ios-maestro.yml`, `android-maestro.yml`) run this package's suite. The
package/target matrix lives in `.github/scripts/maestro-matrix.mjs` — register new example packages and targets there.
Both targets are wired. Like the payments example, the `bare` target commits its own `ios/` and `android/` projects
(the expo target generates its own with `expo prebuild`), and `apps/bare/.gitignore` keeps only build output out. The
bare `MainActivity` drops Android state restoration (`super.onCreate(null)`), which react-native-screens requires for
the native stack.

## Commands

Target scripts live on this package and delegate to the nested workspaces: `ios:bare`, `android:bare`, `start:bare`,
`ios:expo`, `android:expo`, `start:expo`, `prebuild:expo`. `ts`, `lint`, `lint:fix` and `format` cover `src` only.
`e2e:ios:bare`, `e2e:ios:expo`, `e2e:android:bare`, `e2e:android:expo` each run `maestro test -e APP_ID=<target appId>
e2e/flows` against whichever simulator/emulator is currently booted — the app under test must already be built and
installed (`ios:bare`/`android:bare`/`ios:expo`/`android:expo`, or `prebuild:expo` first for the Expo native projects).

## Expo version pins (root `resolutions`)

The root `package.json` pins the expo family (`expo` 57.0.4, `expo-modules-core` 57.0.3, `expo-modules-jsi` 57.0.1,
`expo-asset`/`expo-constants`/`expo-file-system`/`expo-font`/`expo-keep-awake`, `@expo/cli`, `@expo/metro-runtime`) to
one coherent, locally-proven set. Two failure modes forced this, both observed on Xcode 26.x:

- `expo-modules-jsi` 57.0.4 does not compile (`JavaScriptCodable+Date.swift: type of expression is ambiguous`).
- Mixing patch levels across the family crashes at launch with `DYLD Symbol missing` — each `Expo*.framework` is
  compiled against a specific `ExpoModulesCore` ABI, and Expo's `~57.0.x` ranges let sibling modules drift apart.

Keep the set moving together: bump every pin to the same contemporaneous patch line, then
`rm -rf apps/expo/ios && yarn prebuild:expo` and rebuild.

## Dependencies

`@rnw-community/react-native-collapsible-header` (workspace), `react`,
`react-native`, `react-native-reanimated`, `react-native-worklets`, `@react-navigation/native`,
`@react-navigation/native-stack`, `react-native-screens`, `react-native-safe-area-context`.

This is an example/demo package — no unit tests, no build, no publish. It carries the runnable Maestro e2e suite
(`e2e/`) for the collapsible header library and the recording flow behind the library readme's demo GIF.
