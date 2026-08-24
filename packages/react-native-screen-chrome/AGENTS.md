# @rnw-community/react-native-screen-chrome

Composable screen chrome for React Native and React Native Web.

## Package commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn ts:nodenext && yarn lint
```

## Architecture

- `ScreenChromeProvider` owns validated configuration and color scheme only, and mounts a `CollapsibleHeaderProvider`
  that owns `scrollY`, the scroll handler, the animated scroll ref, and the snap registry.
- `ScreenChromeFrame` and `ScreenChromeScrollView` own paint order and safe-area composition; the scroll view takes its
  `onScroll` and `scrollRef` from `useCollapsibleHeaderScroll` and its `scrollEventThrottle` from the provider config.
  Those three props are omitted from its public props so a caller-supplied value fails to compile instead of being
  silently overwritten by the spread order.
- `EdgeFade` has explicit native and web implementations with shared metrics and animation hooks.
- The compound header validates direct slots and delegates all transitions to `react-native-collapsible-header`; it
  renders in `mode="overlay"`, forwards `config.snapToCollapse` as `snap`, and maps config thresholds to normalized
  motion through `getCollapsibleHeaderMotion`.
- Generic leading and trailing control slots live in one persistent layer and must never be duplicated for transitions.

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
- `CollapsibleHeader` sizes the generic header container to `safeAreaInsets.top + config.headerHeight` and reserves the
  inset as `paddingTop`. The generic primitive positions its content layers inside that padding, so leaving the inset
  out of `expandedHeight`/`collapsedHeight` compresses the title and controls to whatever the notch does not consume.
  It is the same composition `mergeScrollContentInset` applies, which keeps overlay content padding aligned.
- The `expo-blur` peer floor is `>=55`: `blurMethod` and the `BlurMethod` type only exist from that release (it renamed
  `experimentalBlurMethod`), and the same release made `dimezisBlurView` require a `BlurTargetView`. `EdgeFade`
  therefore defaults `blurMethod` from `blurTarget` presence rather than hard-coding a targeted method.
- Configuration is validated during provider render, before any chrome component reads it.
- React 19-only syntax (`use()`) stays absent while the `react` peer floor is `>=18`.
- Relative source imports stay extensionless; the build's post-compile rewrite/assert pair enforces extensioned specifiers in `dist/module` and `dist/typescript/module`, and NodeNext validation must pass.
- No manual `useMemo`, `useCallback`, or `React.memo` in `src` — React Compiler owns memoization and `panicThreshold: 'all_errors'` fails the build on anything it cannot compile.
- `EdgeFade` native renders the blur band directly — no `MaskedView`, no `expo-linear-gradient`: gradient native views
  corrupt the Hermes heap on the current RN 0.86 / iOS 26 stack (masked-view 0.3.2 is unmaintained; the gradient
  crashes nondeterministically even standalone). The band fades through the scroll-driven container opacity instead.
  Revisit both when #601 lands.
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
