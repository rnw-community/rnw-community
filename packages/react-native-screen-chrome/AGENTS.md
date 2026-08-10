# @rnw-community/react-native-screen-chrome

Composable screen chrome for React Native and React Native Web.

## Package commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn ts:nodenext && yarn lint
```

## Architecture

- `ScreenChromeProvider` owns scroll state, validated configuration, reduced motion, and collapse snapping.
- `ScreenChromeFrame` and `ScreenChromeScrollView` own paint order and safe-area composition.
- `EdgeFade` has explicit native and web implementations with shared metrics and animation hooks.
- The compound header validates direct slots and delegates all transitions to `react-native-collapsible-header`.
- Generic leading and trailing control slots live in one persistent layer and must never be duplicated for transitions.

## Invariants

- Public content, navigation, typography, theme selection, and actions remain consumer-owned.
- Native peer dependencies remain external so applications own native versions and linking.
- Configuration is validated before animated handlers are created.
- Relative source imports stay extensionless; the build's post-compile rewrite/assert pair enforces extensioned specifiers in `dist/esm`, and NodeNext validation must pass.
- Public exports carry repository-standard scoped TSDoc and package readme links.
- Tests retain at least 99.9% statements, branches, functions, and lines coverage.
