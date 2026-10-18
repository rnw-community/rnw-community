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
- `EdgeFade` has explicit native and web implementations with shared metrics and animation hooks.
- The band renderer (`EdgeFade` `renderBand`, falling back to `ScreenChromeProvider` `renderEdgeFadeBand` through
  context) only swaps the container's children. The container — absolute positioning, `getEdgeFadeBandMetrics`
  geometry, scroll-driven opacity, and the inert pointer/accessibility props — stays package-owned in both
  implementations, and the native blur (with its intensity animation) lives in the internal `EdgeFadeBlur` so the
  renderer receives it as a ready element. With no renderer the rendered tree is identical to the pre-renderer output;
  on web the CSS visuals stay on the container in that case and move into the `blur`/`defaultBand` children only when a
  renderer is set. `CollapsibleHeaderBackdrop` forwards every `EdgeFade` prop except `position`.
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
- Native peer dependencies remain external so applications own native versions and linking.
  `@react-native-masked-view/masked-view`, `expo-linear-gradient`, and `expo-blur` are optional in
  `peerDependenciesMeta`: `edge-fade-native-modules.ts` is the only place that loads them, each through a literal
  `require` inside its own `try` (Metro's `allowOptionalDependencies` only recognises that exact shape, so never route
  them through a shared helper with a computed specifier). Without masked view or linear gradient the native default
  band is a plain `View` with the `buildBackgroundImage` wash as `experimental_backgroundImage`; without `expo-blur`
  `EdgeFadeBlur` renders nothing. The web build (`edge-fade.web.tsx` via the `browser` field) never loads them; the
  public types (`BlurMethod`, `BlurTint`) still reference `expo-blur` as type-only imports.
- `ScreenChromeProvider` `colorScheme` accepts `'system'`, resolved during render by `resolveScreenChromeColorScheme`
  from `useColorScheme()` — never mirrored into state — so the context value stays `'light' | 'dark'`. The hook is
  read unconditionally (rules of hooks) and ignored for fixed schemes.
- `collapsible-header.freeze.spec.tsx` pins `react-freeze` and React `<Activity>` survival. Reanimated's jest
  `AnimatedComponent` re-copies `style.initial.value` into `jestAnimatedStyle` when a hidden view re-attaches, so the
  spec asserts the fade's subscription by scrolling after the cycle instead of reading a stale post-cycle snapshot.
- `EdgeFadeBlur` warns once per mounted band (dev only, Android only) when blur is requested through the band's own
  props — a positive `intensity` or an `intensityInputRange` — while `blurMethod` silently defaults to `'none'` for lack
  of a `blurTarget`. A `useRef` flag (not the effect deps) enforces "once", because `<Activity>` and StrictMode re-run
  effects. The provider `config.intensity` is not checked: after the merge it is indistinguishable from the default.
  The dev check is `typeof __DEV__ !== 'undefined' && __DEV__`, evaluated after the platform check, so runtimes without
  the global never throw. expo-blur already warns for an explicit targeted method without a target, so that case is
  not duplicated.
- `CollapsibleHeader` passes `expandedHeight = safeAreaInsets.top + config.headerHeight` and
  `collapsedHeight = safeAreaInsets.top + (config.collapsedHeaderHeight ?? config.headerHeight)`, and offsets every
  content layer by `top: safeAreaInsets.top`. `collapsedHeaderHeight` is optional and absent from the defaults so an overridden `headerHeight`
  never collapses to a stale default; validation requires a positive `collapsedHeaderHeight` not greater than
  `headerHeight`, matching the primitive's `expandedHeight >= collapsedHeight` assertion. Every other `headerHeight`
  consumer (`ScreenChromeHeader`, `getScreenChromeHeaderMetrics`/`useScreenChromeHeaderMetrics`, and therefore the
  scroll content inset) deliberately keeps the expanded height — content must clear the header at rest — and
  `CollapsibleHeaderBackdrop` stays on its independent `headerBackdropHeight`. Leaving the inset out of
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
- The `expo-blur` peer floor is `>=55`: `blurMethod` and the `BlurMethod` type only exist from that release (it renamed
  `experimentalBlurMethod`), and the same release made `dimezisBlurView` require a `BlurTargetView`. `EdgeFade`
  therefore defaults `blurMethod` from `blurTarget` presence rather than hard-coding a targeted method.
- Configuration is validated during provider render, before any chrome component reads it.
- React 19-only syntax (`use()`) stays absent while the `react` peer floor is `>=18`.
- Relative source imports stay extensionless; the build's post-compile rewrite/assert pair enforces extensioned specifiers in `dist/module` and `dist/typescript/module`, and NodeNext validation must pass.
- No manual `useMemo`, `useCallback`, or `React.memo` in `src` for plain derivations — that is React Compiler's
  job once #601 resolves and compiler output returns. While the compiler is absent (see below), values whose
  _identity_ is behavior — a merged ref callback that React 19 would otherwise detach, clean up, and reattach
  on every render — must be manually memoized; nothing else memoizes them today.
- `EdgeFade` native wraps its blur and wash in `MaskedView` + `expo-linear-gradient` (#640). Do not add further native
  views to the default band while #601 is open — gradient/masked native views have corrupted the Hermes heap on the
  RN 0.86 / iOS 26 stack. Additional visuals (Liquid Glass, solid colors, custom gradients) belong in a consumer
  `renderBand`/`renderEdgeFadeBand`, never in the package default. That includes wash stops: a custom wash
  `locations` is a renderer recipe in the readme, not a prop.
- Web `EdgeFade` keeps a static `backdrop-filter` radius on purpose: animating the radius re-rasterizes the backdrop on
  every scroll frame, while the opacity fade over a fixed blur stays compositor-only. `intensityInputRange`,
  `maxIntensity`, `blurMethod`, and `blurTarget` are documented as no-ops on web.
- Public exports carry repository-standard scoped TSDoc and package readme links.
- Tests retain at least 99.9% statements, branches, functions, and lines coverage.

## Publication pipeline (react-native-builder-bob)

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

`exports` points `import` at `dist/module` (+ `dist/typescript/module` types) and `require` at `dist/commonjs`
(+ `dist/typescript/commonjs` types), types-first in each condition. The NodeNext check must pass before publishing.
