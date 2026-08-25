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
                                   footer-demo-screen.tsx (static header + sticky footer band recipe)
  constant/                      — chrome-demo-items.ts, chrome-demo-style.ts
  interface/                     — chrome-demo-item.interface.ts
  type/                          — chrome-demo-stack-param-list.type.ts
apps/
  bare/                          — @rnw-community/react-native-screen-chrome-example-bare (React Native CLI,
                                   committed ios/ and android/ projects)
  expo/                          — @rnw-community/react-native-screen-chrome-example-expo (Expo; ios/ and android/
                                   come from `expo prebuild`)
e2e/
  flows/                         — collapsible_header_snaps, collapsible_header_expands_on_scroll_back,
                                   static_header_stays_fixed, footer_band_stays_visible
  subflows/                      — launch_home, launch_collapsible_demo
  recording/                     — capture-only flows for readme GIFs
  readme.md                      — flow inventory and appId table
```

## What the demos exercise

- One `ScreenChromeProvider` per screen, never around the navigator — same rule as the library's AGENTS.md.
- `ScreenChromeScrollView` owns scroll wiring (`onScroll`/`scrollRef`/throttle are package-owned props).
- `snapToCollapse` through provider config; per-layer motion customization through the `motion` prop override.
- `ScreenChromeHeader` + `useScreenChromeHeaderMetrics` replacing app-side default-config re-merges.
- The sticky footer band is a documented composition (absolute container + bottom `EdgeFade` + safe-area padding),
  not a library component — keep it that way until #590 lands a real bottom-chrome surface.
- testIDs are stable Maestro hooks: every interactive node carries one (`home-open-*`, `<demo>-*-header`, etc.).

## CI coverage

Both Maestro workflows run this package via `.github/scripts/maestro-matrix.mjs` under `package: 'screen-chrome'`;
the matrix members include the library, this package, and both app shells, so changes confined to one target do not
run the other target's suite.
