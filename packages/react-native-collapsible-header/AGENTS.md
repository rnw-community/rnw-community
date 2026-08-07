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
    collapsible-header.tsx       — public component, geometry validation, and four animated layers
    collapsible-header.spec.tsx  — rendering, validation, animation, clamping, and interaction coverage
  interface/
    collapsible-header-props.interface.ts — public slot, geometry, style, and ViewProps contract
  index.ts                       — public component and props exports
```

## Invariants

- The consumer owns `scrollY`, both content slots, safe-area handling, typography, colors, and product behavior.
- The package owns header height, background opacity, expanded opacity/translation/scale, collapsed opacity/translation,
  clamping, and visible-layer pointer events.
- `react`, `react-native`, and `react-native-reanimated` remain peer dependencies. Never bundle a second Reanimated copy.
- Runtime animation code uses APIs shared by Reanimated 3.17.2 and 4.x.
- Public exports carry the repository-standard one-sentence TSDoc and canonical readme `@see` link.
- Tests must retain at least 99.9% statements, branches, functions, and lines coverage.

## Publication

The package publishes dual ESM and CommonJS output. Relative source imports include explicit `.js` extensions, and the
NodeNext check must pass before publishing.
