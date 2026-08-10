# @rnw-community/react-native-collapsible-header

Generic slot-based collapsible header animation for React Native Reanimated.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn ts:nodenext && yarn lint
```

## Architecture

```text
src/
  assert/
    assert-collapsible-header-progress.assert.ts — normalized progress validation
    assert-finite-collapsible-header-motion-value.assert.ts — finite translation validation
    assert-valid-collapsible-header-config.assert.ts — geometry and motion validation orchestration
    assert-valid-collapsible-header-geometry.assert.ts — header geometry validation
    assert-valid-collapsible-header-motion-config.assert.ts — normalized motion validation
  collapsible-header/
    collapsible-header.tsx       — public component and layer composition
    collapsible-header.spec.tsx  — rendering and validation coverage
    collapsible-header-motion.spec.tsx — animation, clamping, and interaction coverage
    use-collapsible-header-animated-layers.ts — animated style and interaction orchestration
  config/
    default-collapsible-header-motion.config.ts — original-compatible motion preset
    resolve-collapsible-header-motion.config.ts — partial motion override resolution
  interface/
    collapsible-header-animation-config.interface.ts — internal animation hook input
    collapsible-header-motion-config.interface.ts — public normalized motion contract
    collapsible-header-props.interface.ts — public slot, geometry, style, motion, and ViewProps contract
  type/
    collapsible-header-geometry.type.ts — normalized geometry validation input
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

The package publishes dual ESM and CommonJS output. Relative source imports stay extensionless; the `build` script's
`scripts/rewrite-esm-extensions.mjs`/`scripts/assert-esm-extensions.mjs` pair adds and verifies `.js` extensions on the
compiled `dist/esm` output (see root `AGENTS.md`). The NodeNext check must pass before publishing.
