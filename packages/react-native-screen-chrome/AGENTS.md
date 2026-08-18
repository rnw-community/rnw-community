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
  `onScroll` and `scrollRef` from `useCollapsibleHeaderScroll`.
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
- Configuration is validated during provider render, before any chrome component reads it.
- React 19-only syntax (`use()`) stays absent while the react peer floor is `>=18`.
- Relative source imports stay extensionless; the build's post-compile rewrite/assert pair enforces extensioned specifiers in `dist/esm`, and NodeNext validation must pass.
- Public exports carry repository-standard scoped TSDoc and package readme links.
- Tests retain at least 99.9% statements, branches, functions, and lines coverage.
