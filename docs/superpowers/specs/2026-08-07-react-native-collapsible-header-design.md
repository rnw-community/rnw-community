# React Native Collapsible Header Design

## Goal

Add `@rnw-community/react-native-collapsible-header`, a generic React Native component that turns a caller-owned
Reanimated scroll value into a smooth transition between caller-provided expanded and collapsed header content.

The package extracts only the reusable animation shell proven in Budgie. Financial content, localization, privacy
controls, test selectors, NativeWind classes, safe-area handling, and application-specific styling remain with the
consumer.

## Public API

The package exports one `CollapsibleHeader` component and its `CollapsibleHeaderProps` interface.

```tsx
<CollapsibleHeader
    scrollY={scrollY}
    expandedHeight={156}
    collapsedHeight={40}
    collapseDistance={100}
    expandedContent={<ExpandedHeader />}
    collapsedContent={<CollapsedHeader />}
/>
```

Required properties:

- `scrollY: SharedValue<number>` is owned and updated by the consumer's scroll handler.
- `expandedContent: ReactNode` and `collapsedContent: ReactNode` keep all product UI outside the package.
- `expandedHeight: number`, `collapsedHeight: number`, and `collapseDistance: number` define the geometry without
  embedding Budgie's dimensions.

The props interface extends `Omit<ViewProps, 'children'>`, so `style`, `testID`, accessibility properties, and other
standard view properties pass through to the outer container. Package-specific `headerStyle`, `backgroundStyle`,
`expandedContentContainerStyle`, and `collapsedContentContainerStyle` properties expose `StyleProp<ViewStyle>`
overrides for the four internal animated layers.

The initial API intentionally does not expose individual interpolation thresholds or transforms. Those values are a
cohesive animation preset derived from the existing implementation. A later release can add an animation configuration
object if real consumers need a different motion profile.

## Runtime Behavior

The component renders one animated-height container with three overlapping layers:

1. A background layer fades in near the end of collapse.
2. Expanded content fades out, moves upward, and scales down during collapse.
3. Collapsed content fades in and moves into place during the latter half of collapse.

All interpolation clamps below zero and beyond `collapseDistance`. The implementation reads `scrollY.value` for
compatibility with supported Reanimated 3 and 4 releases. Safe-area padding is consumer-owned so the component works
inside screens, navigators, sheets, and custom chrome without requiring `react-native-safe-area-context`.

Invalid geometry is rejected with descriptive runtime errors: heights and collapse distance must be positive, and the
expanded height must be greater than or equal to the collapsed height. This prevents silent inverted or division-by-zero
animation behavior.

## Package Structure

The package follows the RNW Community monorepo conventions:

- dual ESM and CommonJS builds with explicit `.js` relative specifiers;
- React, React Native, and Reanimated peer dependencies;
- public-package metadata, MIT license, changelog, readme, and package-level `AGENTS.md`;
- one public entity per source file and a re-export-only `src/index.ts`;
- colocated Jest specifications and exact public-API TSDoc links;
- inclusion in root documentation and publish-validation scripts where required by existing automation.

## Verification Strategy

### Deterministic component tests

Jest tests use the Reanimated test mock to render the component at scroll positions below zero, zero, each transition
boundary, an intermediate value, the collapse distance, and beyond the collapse distance. Assertions cover:

- expanded and collapsed content rendering;
- expanded, collapsed, and intermediate heights;
- opacity, translation, and scale at each boundary;
- clamping outside the supported scroll range;
- style override composition and outer `ViewProps` forwarding;
- invalid geometry errors.

The package must meet the repository's 99.9% statement, branch, function, and line coverage threshold.

### Package and repository gates

Before push, run package-level format, TypeScript, NodeNext TypeScript, lint, tests, coverage, and dual-format build. Then
run the repository-required `yarn ts`, `yarn lint`, and `yarn test`, followed by publication checks (`yarn publint`,
`yarn smoke:esm`, dead-code detection, and copy/paste detection where practical).

The packed artifact is inspected to confirm that it contains only intended source/build/docs files and that both ESM
`import` and CommonJS `require` resolve the component and declarations.

### Real React Native smoke test

Before calling the PR production-ready, pack the workspace package into a tarball and install that tarball into Budgie
without committing the temporary consumer changes. Replace Budgie's local animation shell with the package while
keeping Budgie's existing expanded and collapsed balance content, then verify on an iOS simulator:

- continuous scroll produces a smooth transition with no flicker or layout oscillation;
- safe-area placement remains controlled by Budgie;
- expanded and collapsed content remain interactive and correctly aligned;
- rapid scroll and overscroll clamp correctly;
- the header behaves after navigation away and back.

This consumer smoke test validates Metro resolution, Reanimated worklets, the packed dependency graph, and real native
layout behavior that Jest cannot prove. Its result is recorded in the pull-request description, including the simulator
and React Native/Reanimated versions used.

## Pull Request Scope

The pull request adds the generic package, documentation, tests, workspace integration, and validation updates to
`rnw-community/rnw-community`. It does not publish a release, modify Budgie permanently, or add application-specific
content. The PR title uses `feat(react-native-collapsible-header): add animated collapsible header`.

## Acceptance Criteria

- The public API contains no Budgie-specific concept or dependency.
- Unit tests prove transition endpoints, intermediate behavior, clamping, prop forwarding, and validation.
- Coverage, type checks, lint, builds, package publication checks, and ESM/CommonJS smoke tests pass.
- A packed-tarball installation works in Budgie on an iOS simulator with the existing header content.
- The branch is pushed and a pull request is opened against RNW Community `master` with verification evidence.
