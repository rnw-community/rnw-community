# @rnw-community/react-native-screen-chrome-example

Private. Single example package for the screen chrome library, with one shared demo layer and two app targets.
Mirrors the structure of `react-native-collapsible-header-example`.

## Layout

```text
src/
  index.ts                       — exports `App`
  component/                     — app.tsx (native stack + enableFreeze + SafeAreaProvider, no chrome provider at the
                                   navigator level), chrome-demo-home-screen.tsx (demo picker),
                                   chrome-demo-link.tsx, chrome-demo-list.tsx (provider-wired scroll view with
                                   optional content insets), chrome-demo-list-item.tsx,
                                   collapsible-demo-screen.tsx (compound slots + snap + motion override + top fade),
                                   static-header-demo-screen.tsx (static header + metrics-driven content inset),
                                   footer-demo-screen.tsx (static header + `ScreenChromeFooter` fed back into
                                   the list through `useBottomChromeInset`),
                                   chrome-demo-collapsible-header.tsx (compound header shared by the collapsible
                                   and snap-off screens, testIDs under a prefix), snap-off-demo-screen.tsx,
                                   bottom-fade-demo-screen.tsx (scroll-driven bottom `EdgeFade`),
                                   tab-bar-demo-screen.tsx (floating tab bar in `ScreenChromeFooter`),
                                   keyboard-demo-screen.tsx (footer in `KeyboardStickyView`),
                                   theme-demo-screen.tsx (`colorScheme` from app state),
                                   edge-fade-demo-screen.tsx (measured scheme/background matrix over stripes and text,
                                   separate wash-free blur-only state, and programmatic temporal scroll witness)
  constant/                      — chrome-demo-items.ts, chrome-demo-style.ts
  interface/                     — chrome-demo-item.interface.ts
  type/                          — chrome-demo-stack-param-list.type.ts
apps/
  bare/                          — @rnw-community/react-native-screen-chrome-example-bare (React Native CLI,
                                   committed ios/ and android/ projects)
  expo/                          — @rnw-community/react-native-screen-chrome-example-expo (Expo; ios/ and android/
                                   come from `expo prebuild`)
e2e/
  harness/                       — edge-fade-metrics.mjs (shared pixel metrics), its mutation tests
                                   (`e2e:harness:check`), platform baselines
  recording/                     — manual Maestro capture-only flows for readme GIFs (not run in CI)
  manual/                        — manual Maestro playground matrix and its metrics (not run in CI)
  subflows/                      — launch_home, launch_collapsible_demo: Maestro steps the
                                   capture flows include
  readme.md                      — test inventory and appId table
```

The CI e2e tests live in the repo root `e2e/tests/screen-chrome/` (collapsible_header_snaps,
collapsible_header_expands_on_scroll_back, static_header_stays_fixed, footer_band_stays_visible,
snap_off_header_scrolls_freely, bottom_fade_follows_scroll, tab_bar_switches_tabs, keyboard_footer_stays_above_keyboard,
theme_switches_scheme) and `e2e/tests/screen-chrome-harness/` (edge_fade_harness, edge_fade_temporal_harness), with
shared steps in `e2e/support/screen-chrome.ts`, `edge-fade.ts` and `edge-fade-plan.ts`.

## What the demos exercise

- One `ScreenChromeProvider` per screen, never around the navigator — same rule as the library's AGENTS.md.
- `ScreenChromeScrollView` owns scroll wiring (`onScroll`/`scrollRef`/throttle are package-owned props).
- `snapToCollapse` through provider config; per-layer motion customization through the `motion` prop override.
- `ScreenChromeHeader` + `useScreenChromeHeaderMetrics` replacing app-side default-config re-merges.
- The sticky footer band is the library's `ScreenChromeFooter` under a per-screen `BottomChromeInsetProvider`; the list
  clears it through `useBottomChromeInset().chromeHeight` instead of a hard-coded bottom inset. The `footer-demo-band`,
  `footer-demo-fade`, `footer-demo-bar`, and `footer-demo-total` testIDs are e2e hooks and stay stable.
- `app.tsx` mounts `react-native-keyboard-controller`'s `KeyboardProvider` at the root (it is app-level, not chrome);
  the keyboard demo follows the library readme's `KeyboardStickyView` recipe. The keyboard controller is a native
  dependency, so both app shells list it for autolinking.
- testIDs are stable e2e hooks: every interactive node carries one (`home-open-*`, `<demo>-*-header`, etc.).

## CI coverage

Both e2e workflows (`.github/workflows/ios-maestro.yml`, `android-maestro.yml`) run this package's `screen-chrome-bare` and `screen-chrome-expo` targets, and run every
example package's suite when any target's app package is affected. On iOS both targets set `tolerateTestFailures`
until #601 is fixed.

The PR workflow separately runs the required edge-fade harness (`e2e/tests/screen-chrome-harness`, Android on the
`android-gms` target) through mobile-ci on iOS and Android, then downloads the `edge-fade/` captures from the
`e2e-<platform>-edge-fade--screen-chrome-harness` artifact and applies the shared metric script. Chromium runs the same matrix in the web e2e job.
`Required checks` includes all three platforms. The harness covers both schemes, three backgrounds, top and bottom
bands, and rest/scrolled states against unblurred references; regenerate native goldens from reviewed CI captures.
