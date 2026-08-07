# @rnw-community/react-native-collapsible-header

Generic slot-based collapsible header animation for React Native Reanimated.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn ts:nodenext && yarn lint
```

## Architecture

```text
src/
  collapsible-header/
    collapsible-header.tsx       — public component, geometry and motion validation, and animated layers
    collapsible-header.spec.tsx  — rendering, validation, animation, clamping, and interaction coverage
  constant/
    default-collapsible-header-motion-config.constant.ts — original-compatible motion preset
  interface/
    collapsible-header-motion-config.interface.ts — public normalized motion contract
    collapsible-header-props.interface.ts — public slot, geometry, style, motion, and ViewProps contract
  utils/
    assert-valid-collapsible-header-config.util.ts — geometry and motion validation
    resolve-collapsible-header-motion-config.util.ts — partial motion override resolution
  index.ts                       — public component and props exports
```

## Invariants

- The consumer owns `scrollY`, both content slots, safe-area handling, typography, colors, and product behavior.
- The package owns header height, background opacity, expanded opacity/translation/scale, collapsed opacity/translation,
  clamping, persistent layer placement, and visible-layer pointer events.
- `persistentContent` mounts once above the expanded and collapsed transition layers and uses `box-none` pointer events.
- `collapseStart` is optional, non-negative, and defaults to `0`; collapse progress is normalized across
  `[collapseStart, collapseStart + collapseDistance]`.
- `motion` is additive and partial. Missing fields resolve against the original-compatible default preset before
  validation, so omitted options preserve existing behavior.
- Motion progress values are validated within `[0, 1]`, collapsed opacity cannot start after expanded opacity ends,
  translations must be finite, and expanded scale must be greater than zero.
- `react`, `react-native`, and `react-native-reanimated` remain peer dependencies. Never bundle a second Reanimated copy.
- Runtime animation code uses APIs shared by Reanimated 3.17.2 and 4.x.
- Public exports carry the repository-standard one-sentence TSDoc and canonical readme `@see` link.
- Tests must retain at least 99.9% statements, branches, functions, and lines coverage.

## Publication

The package publishes dual ESM and CommonJS output. Relative source imports include explicit `.js` extensions, and the
NodeNext check must pass before publishing.
