# @rnw-community/react-native-screen-chrome

Composable screen chrome for React Native and React Native Web.

## Package commands

```bash
pnpm test && pnpm test:coverage && pnpm build && pnpm ts && pnpm ts:nodenext && pnpm lint
```

## Architecture

- `ScreenChromeProvider` owns validated configuration and color scheme only, and mounts a `CollapsibleHeaderProvider`
  that owns `scrollY`, the scroll handler, the animated scroll ref, and the snap registry.
- `ScreenChromeFrame` and `ScreenChromeScrollView` own paint order and safe-area composition; the scroll view takes its
  `onScroll` and `scrollRef` from `useCollapsibleHeaderScroll` and its `scrollEventThrottle` from the provider config.
  Those three props are omitted from its public props so a caller-supplied value fails to compile instead of being
  silently overwritten by the spread order.
- `ScreenChromeScrollView` delegates all scroll wiring to `useScreenChromeScrollProps` (merged ref, `onScroll`,
  `scrollEventThrottle`, `contentContainerStyle` per `contentInsetMode`, `scrollIndicatorInsets` and
  `automaticallyAdjustsScrollIndicatorInsets: false`) and only adds the animated `ScrollView`; the hook is the single
  place that knowledge lives, so `Animated.FlatList`, FlashList, and LegendList get identical wiring by spreading it.
- `ScreenChromeProvider` accepts an optional external `scrollY` shared value and exposes it on the context as
  `externalScrollY` (named so a consumer of `useScreenChrome()` cannot mistake it for the driving offset, which is
  absent in the default mode). `useScreenChromeScrollY` (`externalScrollY` ?? `useCollapsibleHeaderScroll().scrollY`)
  is the single place the scroll source is resolved: the edge-fade opacity/blur hooks, `useScrollInterpolation` (and
  `useScrollFadeStyle` on top of it) read it, and `CollapsibleHeader` forwards the external value to the primitive's
  `scrollY` prop. Never read `useCollapsibleHeaderScroll().scrollY` directly in a new scroll-driven hook. An external
  `scrollY` combined with `snapToCollapse` throws an `Error` from `assertScreenChromeScrollSource` during provider
  render, matching the primitive's own single-scroll-source assertion and error class.
- `EdgeFade` has explicit native and web implementations with shared metrics and animation hooks.
- The band renderer (`EdgeFade` `renderBand`, falling back to `ScreenChromeProvider` `renderEdgeFadeBand` through
  context) only swaps the container's children. The container — absolute positioning, `getEdgeFadeBandMetrics`
  geometry, scroll-driven opacity, and the inert pointer/accessibility props — stays package-owned in both
  implementations, and the native blur (with its intensity animation) lives in the internal `EdgeFadeProgressiveBlur` so the
  renderer receives it as a ready element. With no renderer the rendered tree is identical to the pre-renderer output;
  on web the CSS visuals stay on the container in that case and move into the `blur`/`defaultBand` children only when a
  renderer is set. `CollapsibleHeaderBackdrop` forwards every `EdgeFade` prop except `position`; by default it stays visible with static blur through collapse; it draws no second layer, so the header gets the same ramp as every band.
- The compound header validates direct slots and delegates all transitions to `react-native-collapsible-header`; it
  renders in `mode="overlay"`, forwards `config.snapToCollapse` as `snap`, and maps config thresholds to normalized
  motion through `getCollapsibleHeaderMotion`.
- Generic leading and trailing control slots live in one persistent layer and must never be duplicated for transitions.
  Both are optional; a missing one is replaced by an empty `pointerEvents="none"` placeholder so the `space-between`
  row keeps a lone trailing control right-aligned.
- Slot discovery (`getCollapsibleHeaderSlots`) classifies direct children through `getCollapsibleHeaderSlotKind`: the
  static string marker `screenChromeSlotKind` (`'control'`/`'title'`) on the element type, never component identity:
  identity breaks when a bundle resolves two copies of this package (`dist/module` +
  `dist/commonjs`). Exactly one title slot is required; a control slot before it is leading, after it trailing, at
  most one each; unknown types, a missing title slot, and duplicates throw a `TypeError`. Context registration was
  rejected because it renders an empty header on the first frame.
- Bottom chrome is `ScreenChromeFooter` (absolute `box-none` container, safe-area bottom padding, bottom `EdgeFade`
  behind a measured content node) plus the inset contract: `BottomChromeInsetProvider` keeps a map of per-footer
  heights keyed by a stable `Symbol` each footer creates in `useState`, and splits it into two contexts — the
  published number (the max over registered footers, since bottom-anchored footers overlap) and a stable
  `{ publish, withdraw }` registry created once in `useState` — so a publishing footer does not subscribe to its own
  height change. Unchanged heights and unknown withdrawals return the previous map, so they do not re-render.
  `useBottomChromeInset` returns `{ chromeHeight, inset }`. `chromeHeight` excludes the safe area
  because `ScreenChromeScrollView` already adds `insets.bottom` to `contentInsetBottom`; `inset` includes it.
  The footer publishes from a `useLayoutEffect` `measure` on mount (no one-frame reserve-0 jump) and from `onLayout`
  for resizes, and withdraws only its own entry on unmount. The registry context defaults to `emptyFn` methods, so the
  footer and hook work without a provider.

## Bottom chrome scope (#590)

- **No custom tab bar and no hide-on-scroll bottom bar.** Expo Router `NativeTabs` renders the platform tab bar
  (Liquid Glass on iOS 26, with native minimize-on-scroll) and owns its insets, so a JS tab bar here would only trail
  the platform. Do not re-add one; bottom chrome in this package is screen-level (`ScreenChromeFooter`).
- Bottom chrome the app owns (a custom tab bar) publishes through the exported `useBottomChromeHeightPublisher`, the same
  hook the footer uses; a declared `height` skips measurement so hidden chrome keeps its reservation.
- A footer stacked above other bottom chrome takes an explicit `bottomOffset` (folded into its published height through
  the publisher `offset`) rather than reading `useBottomChromeInset`, which already includes the footer and would feed
  back into itself.
- **No keyboard dependency.** `react-native-keyboard-controller` is the standard; the readme documents wrapping
  `ScreenChromeFooter` in its `KeyboardStickyView`. Transforms never fire `onLayout`, so the published inset is the
  footer's resting height while the keyboard is open — keep the inset measurement-driven, never keyboard- or
  scroll-frame-driven.
- `ScreenChromeScrollView` is intentionally untouched by the bottom inset contract; consumers pass
  `useBottomChromeInset().chromeHeight` into `contentInsetBottom`.
- No new native views for bottom chrome: the footer reuses `EdgeFade` (see the #601 invariant below).

## Invariants

- Public content, navigation, typography, theme selection, and actions remain consumer-owned.
- No scroll handler, `scrollTo`, snap arithmetic, or reduced-motion branch lives in this package. Motion, scroll wiring
  and snapping belong to `@rnw-community/react-native-collapsible-header`; reanimated is used here only for
  `interpolate`, `useAnimatedStyle`, `useAnimatedProps`, and `createAnimatedComponent` in the fade layer.
- `@rnw-community/react-native-collapsible-header` is a peer dependency, never a bundled one — a second copy creates a
  second scroll-context identity and every chrome component then fails to find its provider.
- **One `ScreenChromeProvider` per scrollable, mounted inside each screen — never once around a navigator**, inherited
  from the collapsible header provider it wraps.
- `snapToCollapse` only takes effect while a `CollapsibleHeader` is mounted: the header registers the snap geometry
  with the provider. Reduced-motion-aware snapping is upstream scope, not a local reimplementation.
- Native peer dependencies remain external so applications own native versions and linking. The package itself is an
  Expo module (`expo-module.config.json`, `ios/`, `android/`) with one view, `ScreenChromeProgressiveBlurView`
  (`position`, `radius`, `plateau`), required on iOS and Android: there is no fallback blur and no
  optional loading. The web build (`edge-fade.web.tsx` via the `browser` field) never imports it.
- `ScreenChromeProvider` `colorScheme` accepts `'system'`, resolved during render by `resolveScreenChromeColorScheme`
  from `useColorScheme()` — never mirrored into state — so the context value stays `'light' | 'dark'`. The hook is
  read unconditionally (rules of hooks) and ignored for fixed schemes.
- `collapsible-header.freeze.spec.tsx` pins `react-freeze` and React `<Activity>` survival. Reanimated's jest
  `AnimatedComponent` re-copies `style.initial.value` into `jestAnimatedStyle` when a hidden view re-attaches, so the
  spec asserts the fade's subscription by scrolling after the cycle instead of reading a stale post-cycle snapshot.
- `CollapsibleHeader` passes `expandedHeight = safeAreaInsets.top + config.headerHeight` and
  `collapsedHeight = safeAreaInsets.top + (config.collapsedHeaderHeight ?? config.headerHeight)`, and offsets every
  content layer by `top: safeAreaInsets.top`. `collapsedHeaderHeight` is optional and absent from the defaults so an overridden `headerHeight`
  never collapses to a stale default; validation requires a positive `collapsedHeaderHeight` not greater than
  `headerHeight`, matching the primitive's `expandedHeight >= collapsedHeight` assertion. Every other `headerHeight`
  consumer (`ScreenChromeHeader`, `getScreenChromeHeaderMetrics`/`useScreenChromeHeaderMetrics`, and therefore the
  scroll content inset) deliberately keeps the expanded height — content must clear the header at rest — and
  `CollapsibleHeaderBackdrop` keeps its independent `headerBackdropHeight`. Leaving the inset out of
  `expandedHeight`/`collapsedHeight` compresses the title and controls to whatever the notch does not consume, and
  `paddingTop` on `headerStyle` does not move them at all: the primitive renders the expanded, collapsed, and persistent
  layers as `position: absolute` boxes with inset `0`, which resolve against the container box and ignore its padding,
  centering the content over the inset band. The container height is the same composition `mergeScrollContentInset`
  applies, which keeps overlay content padding aligned.
- The generic `motion` mapping omits `pointerEventsSwitchProgress` on purpose so the primitive derives it from the
  cross-fade midpoint of the mapped `smallTitleStart`/`largeTitleEnd` windows; pinning it to a fixed progress hands
  pointer events and the accessibility tree to a title layer that is still transparent.
- The `@rnw-community/react-native-collapsible-header` peer floor is `>=2.18.0`: the derived
  `pointerEventsSwitchProgress` default (2.17.3) and `syncNativeScrollOffset` (2.18.0) are both load-bearing, and an
  older primitive accepts the props silently while reintroducing the transparent-layer pointer handoff.
- Header slots are `pointerEvents="box-none"`: the slot box defaults to a 44pt minimum for layout, but only its
  children receive touches, so an empty or narrow slot never swallows taps meant for the layers underneath. The
  consumer `style` merges last on purpose — it is the sizing escape hatch, so a consumer that overrides `minWidth`/
  `minHeight` owns the touch-target size of the control it renders.
- Configuration is validated during provider render, before any chrome component reads it.
- React 19-only syntax (`use()`) stays absent while the `react` peer floor is `>=18`.
- Relative source imports stay extensionless; the build's post-compile rewrite/assert pair enforces extensioned specifiers in `dist/module` and `dist/typescript/module`, and NodeNext validation must pass.
- No manual `useMemo`, `useCallback`, or `React.memo` in `src` for plain derivations — that is React Compiler's
  job once #601 resolves and compiler output returns. While the compiler is absent (see below), values whose
  _identity_ is behavior — a merged ref callback that React 19 would otherwise detach, clean up, and reattach
  on every render — must be manually memoized; nothing else memoizes them today.
- Native `EdgeFade` is the native blur view under a wash `View` whose `experimental_backgroundImage`
  (`buildNativeWashImage`) blends the RGB of the two wash colors and takes each stop's alpha as the configured color alpha times the `maskStops` alpha, so a
  translucent color leaves blurred content visible at the edge (web `buildBackgroundImage` passes the configured colors through and
  the CSS mask supplies the `maskStops` alpha); nothing is masked,
  because a mask on a superview of a `UIVisualEffectView` stops the blur rendering. The blur's own eased image mask
  is applied directly to the effect view, which UIKit supports. The view holds the full radius
  (`plateau`, `EDGE_FADE_FULL_BLUR_FRACTION`) only over the outermost 8% of the band, then eases in with `m = d²`
  (`d` is 0 at the inner edge and 1 at the plateau) so content stays nearly sharp for most of the band, and fades to zero at the inner edge (Core Animation `variableBlur` with an eased radius and output mask on iOS; a QmBlurView eased out
  through a `DST_IN` gradient on Android; both ported from `@sbaiahmed1/react-native-blur`, see
  `THIRD_PARTY_NOTICES.md`). Never tie the plateau to the chrome height or use an
  S-curve (smoothstep is steepest mid-ramp): both compress the transition and read as a line where the blur starts.
  `chromeHeight` is accepted for compatibility and ignored. `intensityInputRange` fades the view through opacity,
  never by changing its radius, which would rebuild the native filter every frame. The edge-fade harness (below) is
  the regression gate for the look on every platform. Additional visuals belong in a consumer
  `renderBand`/`renderEdgeFadeBand`, never in the package default.
- The edge-fade harness is the regression gate for the blur look on every platform. The example's
  `EdgeFadeDemoScreen` renders both bands (`height` 128, `chromeHeight` 32), fixed 3-point stripes and text, and a ruler
  column marking chrome and ramp rows. Every scheme/background cell explicitly configures the provider's solid and wash
  RGB to match its dark, light or vivid screen background. `e2e/harness/edge_fade_harness.yaml` drives the unchanged
  reference/rest/scrolled state matrix on iOS and Android; `web-e2e/edge-fade-matrix.e2e.ts` drives the same static
  matrix in Chromium (headless Linux WebKit renders no `backdrop-filter`).
- `e2e/harness/edge-fade-metrics.mjs` measures Laplacian energy, row color, known-background edge mean/variance, and the
  background-distance profile smoothed over one 24-point text line before running a maximum reversal check from the
  physical screen edge inward. Direct edge variance still catches texture on the physical last row when its mean is
  within threshold. Rest checks use absolute pixel differences and cannot miss mean-preserving blur. Thresholds live in
  `THRESHOLDS`: chrome zone keeps at most 0.2 of reference detail; the ramp returns to at least 0.8, loses at most 0.12,
  and rises at most 0.165 per point; its 20–80% contrast transition, measured from the physical edge across the whole band, spans at least 35% of the band; outside content keeps at least 0.85; wash shifts at most 6 levels at the inner edge
  and 3 outside; physical-edge mean is within 10 levels of the known background and deviation within 8; top/bottom
  ramps differ at most 0.25; rest differs at most 2 levels. A separate `edge_fade_temporal_harness.yaml` scrolls a real
  native `ScrollView` from 200 to 400 over 300 rendered frames (about five seconds at 60 Hz) with invariant vertical stripes, records six scheme/background
  cells, and CI extracts every decoded frame (`-fps_mode passthrough`) before the native metric CLI checks band spikes and background edges. The web
  matrix imports only `checkCaptureDir` and does not require temporal artifacts. Synthetic mutations cover missing
  blur, stepped slices, compressed ramp, wrong/missing background, physical-last-row texture, slow profile reversal,
  temporal spike, hard wash edge, and visible-at-rest bands. Keep baseline PNGs unchanged until a parent has inspected
  the CI capture images; update only reviewed CI captures.
- Web `EdgeFade` matches the Android blend (`getWebEdgeFadeBlurLayers`): one fixed-radius `backdrop-filter` with an
  eased output mask across the full ramp, plus a separately masked wash. The full-opacity plateau is the same outer 8% and the mask follows the same `d²` ramp. The filter box extends two radii past the inner edge so its sampling boundary cannot show
  through the mask. Never put opacity below 1, a mask, or a filter on an ancestor: that creates a backdrop root and
  prevents sampling the page. Scroll opacity animates the visual layers, with a static radius.
- Public exports carry repository-standard scoped TSDoc and package readme links.
- Tests retain at least 99.9% statements, branches, functions, and lines coverage.

## 3.0 migration contract

- This is a breaking release: `blurMethod`, `blurTarget` (including on `CollapsibleHeaderBackdrop`) and renderer `tint`
  are removed without shims. The optional external blur stack is gone: `expo-blur`,
  `@react-native-masked-view/masked-view`, `expo-linear-gradient`, and `@sbaiahmed1/react-native-blur` are unnecessary.
- `expo >=55 <59` and a rebuilt native binary containing this package's module are required. No Expo Go and no
  missing-module fallback. Bare apps configure Expo modules with `npx install-expo-modules@latest` or the manual setup.
  If iOS removes its private variable-blur filter, hide the effect view instead of showing a uniform hard-edged blur.
  Web keeps CSS backdrop filtering.
- Native `intensityInputRange` fades a fixed radius using `maxIntensity`; bands begin at the screen edge and the
  native header-backdrop default is 128 points. `chromeHeight` no longer changes the full-strength region.
- Keep [Migrating to 3.0](readme.md#migrating-to-30) and `llms.txt` aligned with the public surface.

## Publication pipeline (react-native-builder-bob)

Declaration generation uses `scripts/typecheck.mjs` through bob's explicit `tsc` option: pinned tsrs where its binary is available, otherwise the native reference compiler. Babel owns JavaScript output.

The package builds with `react-native-builder-bob`, configured in `package.json` under `react-native-builder-bob`:

- targets: `["module", { esm: true }]` → `dist/module`, `["commonjs", { esm: true }]` → `dist/commonjs`, and
  `typescript` → `dist/typescript/module` + `dist/typescript/commonjs` declaration trees (from `tsconfig.build.json`,
  which excludes specs).
- **React Compiler precompiled output is deliberately absent**: the compiler-transformed code corrupts the Hermes heap
  at runtime on the current RN 0.86 / iOS 26 stack (crash bisect in #601 — the identical demo flow passes with the
  plain bob build and crashes with compiler output). Do not re-add `babel-plugin-react-compiler` to the bob or jest
  babel configs until #601 is resolved upstream.
- `'worklet'` directives pass through untouched; the consumer app's worklets plugin compiles them.
- Platform splits (`edge-fade.web.tsx`, `screen-chrome-default-config.constant.web.ts`) compile into every dist tree,
  and the four `browser` field keys map the native emitted file to its `.web.js` sibling in `dist/commonjs` and
  `dist/module`.
- Bob deliberately leaves a relative specifier extensionless when the target has a platform-specific sibling, which
  breaks Node's ESM resolver and the repository extension invariant. `build:esm-extensions` therefore runs
  `scripts/rewrite-esm-extensions.mjs` over `dist/module` and `dist/typescript/module` and re-asserts both trees with
  `scripts/assert-esm-extensions.mjs`; web resolution stays intact because the `browser` field, not platform-extension
  probing, is what selects the web file in published output.
- Resolvers (Metro, webpack, Vite, esbuild) read `browser` replacements from the `package.json` nearest the importing
  file, and inside `dist` that is bob's per-tree `{"type": ...}` marker, not the package root — Expo web bundled the
  native `edge-fade.js` while only the root carried the map. `scripts/write-browser-field-markers.mjs` therefore mirrors
  every root `browser` entry, rebased, into `dist/module/package.json` and `dist/commonjs/package.json` as the last build
  step, and `pnpm assert:pack` fails when a marker lacks a root mapping.
- Expo's Metro resolves iOS and Android with `resolverMainFields` `['react-native', 'browser', 'main']`, so a `browser`
  map alone swaps the web `EdgeFade` and web default config into native bundles (no `BlurView`, 108 px backdrop). The
  marker writer therefore also writes a `react-native` map pinning every `browser` source to itself; Metro merges
  object main fields with the earliest field winning, so native keeps the native file, while Expo web
  (`['browser', 'module', 'main']`), webpack, Vite and esbuild never read `react-native`. `pnpm assert:pack` fails when
  a marker lacks the pin.

`exports` points `import` at `dist/module` (+ `dist/typescript/module` types) and `require` at `dist/commonjs`
(+ `dist/typescript/commonjs` types), types-first in each condition. The NodeNext check must pass before publishing.
