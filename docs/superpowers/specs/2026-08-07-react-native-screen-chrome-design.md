# React Native Screen Chrome Design

## Goal

Add `@rnw-community/react-native-screen-chrome`, a generic React Native and React Native Web package for scroll-driven
screen chrome. The package extracts the complete reusable `@budgie/screen-chrome` surface: progressive edge fade and
blur bands, collapsible large-to-small titles, safe-area-aware screen structure, shared scroll state, configurable
collapse snapping, and composition slots for consumer-owned navigation and actions.

The package contains no Budgie navigation, theme, localization, financial UI, selectors, NativeWind classes, or
application-specific layout. Consumers provide all visible title, leading, trailing, content, and action elements.

## Pull Request Train

The work is delivered as two independently reviewable branches:

1. `codex/react-native-collapsible-header` targets RNW Community `master` and contains the generic collapsible primitive.
2. `codex/react-native-screen-chrome` branches from and targets `codex/react-native-collapsible-header`.

The Screen Chrome branch must contain only commits added after the Collapsible Header branch head. No branch is pushed
and no pull request is created until explicitly requested. When the first pull request merges, the second pull request
is retargeted to `master` without rebasing away its review history unless the repository requires it.

## Package Boundary

The package preserves the complete generic behavior of `@budgie/screen-chrome` while adapting it to RNW Community
publication conventions. It exports:

- `ScreenChromeProvider`, `useScreenChrome`, `useScreenChromeScrollHandler`, and `useScrollFadeStyle`;
- `ScreenChromeFrame`, `ScreenChromeContent`, and `ScreenChromeScrollView`;
- `EdgeFade` with native and web implementations;
- `CollapsibleHeader`, `CollapsibleHeaderBackdrop`, `CollapsibleHeaderLeading`,
  `CollapsibleHeaderTitleSlot`, `CollapsibleHeaderLargeTitle`, `CollapsibleHeaderSmallTitle`, and
  `CollapsibleHeaderTrailing`;
- `ColorSchemeEnum`, configuration interfaces, edge-fade interfaces, and the public ref/content-inset merge utilities.

The compound header API remains recognizable to current consumers. Leading and trailing controls are mounted once in a
persistent layer. Large and small title content occupy the expanded and collapsed layers respectively. The package
does not duplicate interactive children to create the transition.

## Collapsible Header Dependency Contract

`@rnw-community/react-native-screen-chrome` declares `@rnw-community/react-native-collapsible-header` as a runtime
dependency and delegates the header layer geometry, visibility, transforms, clamping, and pointer-event handoff to it.

To support the compound Screen Chrome behavior without duplicating controls, the first package gains two generic APIs:

- optional `persistentContent`, rendered once above the expanded and collapsed layers;
- optional motion configuration for expanded opacity/translation/scale, collapsed opacity/translation, background
  opacity, and their input ranges.

The default motion configuration remains identical to the already-tested standalone collapsible-header preset, so the
existing public behavior is unchanged for consumers that omit the new properties. Screen Chrome supplies a fixed-height
configuration, zero title transforms, and its provider-owned `collapseStart`, `smallTitleStart`, `largeTitleEnd`, and
`collapseEnd` thresholds.

Screen Chrome does not re-export types owned by the collapsible-header package. Consumers that need those types import
them from `@rnw-community/react-native-collapsible-header` directly.

## Composition and Data Flow

`ScreenChromeProvider` owns the animated scroll ref, native scroll offset, merged configuration, color scheme, reduced
motion state, and collapse-snap handler. `ScreenChromeScrollView` merges its consumer ref with the provider ref and
writes scroll events into the same shared value. Custom scroll views can use `useScreenChromeScrollHandler` instead.

The shared scroll value drives three independent consumers:

1. `EdgeFade` interpolates container opacity and, on native, blur intensity.
2. `CollapsibleHeaderBackdrop` configures a top `EdgeFade` aligned with collapse thresholds.
3. `CollapsibleHeader` passes the shared value and provider thresholds into the collapsible-header package.

The frame remains paint-order driven: content renders first so native blur can sample it, edge fades render next, and
interactive header chrome renders last. Safe-area insets remain owned by Screen Chrome because this package explicitly
models full-screen chrome, unlike the lower-level collapsible-header package.

## Configuration

The extracted configuration retains the current platform-specific defaults and deep-merge behavior for:

- header, top fade, bottom fade, and backdrop heights;
- static and maximum animated blur intensity;
- collapse and title transition thresholds;
- scroll event throttle and optional snap-to-collapse behavior;
- light and dark solid/wash colors;
- top and bottom mask stops.

Configuration validation rejects non-finite or invalid geometry and threshold ordering with descriptive errors. The
required ordering is `collapseStart <= smallTitleStart <= largeTitleEnd <= collapseEnd`. Heights, throttle, and blur
intensities must be non-negative, with a positive header height and a non-zero collapse interval. Invalid configuration
must not silently produce inverted interpolation ranges or unstable scrolling.

## Platform Behavior

Native `EdgeFade` combines `@react-native-masked-view/masked-view`, `expo-linear-gradient`, and `expo-blur`. It remains
decorative, ignores pointer events, and is hidden from accessibility traversal. Its blur tint follows the injected color
scheme, and Android retains the configurable blur method.

Web `EdgeFade` uses CSS backdrop filtering and mask images. Scroll animation affects opacity while blur stays static,
matching the proven source behavior. Platform-specific default configuration and component files remain explicit
`.web.ts` or `.web.tsx` variants.

Collapse snapping only runs for offsets strictly inside the collapse interval. A drag with residual momentum defers to
momentum end, preventing duplicate snaps. Reduced-motion users receive an immediate scroll adjustment rather than an
animated one.

## Dependencies and Publication

The package follows RNW Community's dual ESM/CommonJS package shape with explicit `.js` relative specifiers, NodeNext
verification, public-package metadata, MIT license, changelog, readme, package-level `AGENTS.md`, and scoped TSDoc on
every public export.

Runtime dependencies are limited to reusable JavaScript packages, including
`@rnw-community/react-native-collapsible-header`, `@rnw-community/shared`, and `react-native-easing-gradient` where the
native mask generation still requires it. React, React Native, Reanimated, safe-area context, Expo blur and linear
gradient, and masked view remain peer-owned native dependencies. Peer ranges follow the broadest versions demonstrated
by tests and the Budgie smoke consumer rather than copying Budgie's exact pins.

## Verification Strategy

### Deterministic package tests

Colocated Jest tests cover:

- provider defaults, deep configuration merging, stable context identity, and the missing-provider error;
- validation failures for geometry, thresholds, mask stops, colors, and numeric configuration;
- scroll offset propagation, consumer handler composition, ref merging, and additive content insets;
- snap boundaries, midpoint selection, velocity deferral, momentum completion, and reduced motion;
- native and web edge-fade layout, mask, gradient, opacity, blur, accessibility, and pointer-event behavior;
- compound header slot placement and single mounting of persistent leading/trailing controls;
- delegation of title transition behavior to `@rnw-community/react-native-collapsible-header`;
- consumer styles, props, custom scroll views, and platform-specific defaults.

The package must meet the repository's 99.9% statement, branch, function, and line coverage threshold.

### Package and repository gates

Run package format, TypeScript, NodeNext TypeScript, lint, tests, coverage, and dual-format build. Then run the required
repository TypeScript, lint, test, publication, ESM/CommonJS smoke, dead-code, and copy/paste gates. Inspect the packed
artifact to ensure only intended build and documentation files ship and that all peer dependencies remain external.

### Stacked packed-tarball smoke test

Pack both local RNW packages and install the exact tarballs into a temporary Budgie worktree. Replace
`@budgie/screen-chrome` imports with `@rnw-community/react-native-screen-chrome` without committing consumer changes.
Build and run the iOS app, then exercise:

- expanded, intermediate, and collapsed title states;
- persistent leading/trailing interaction throughout the transition;
- top and bottom edge fades over real scrolling content;
- safe-area placement and content inset merging;
- rapid scroll, overscroll, collapse snapping, and reduced-motion behavior;
- navigation away/back with restored header state;
- overlays and menus without transparent-window compositing;
- native Metro resolution of both packed packages with no duplicate Reanimated installation.

The second pull-request description records the simulator, React Native, Reanimated, and tarball versions used.

## Out of Scope

- Publishing either package to npm.
- Committing Budgie migration changes.
- Providing navigation controls, text, icons, localization, or theme integration.
- Re-exporting dependencies' public types.
- Supporting arbitrary nested compound-slot discovery; documented header slots are direct children.
- Creating or pushing either pull request before explicit approval.

## Acceptance Criteria

- The Screen Chrome branch is based on the Collapsible Header branch and has no changes already present in its base.
- The first pull request remains independently valid against `master`.
- The package exposes the approved full generic Screen Chrome API under
  `@rnw-community/react-native-screen-chrome`.
- Persistent interactive slots mount once and remain usable during title transitions.
- All header transition mechanics are delegated to `@rnw-community/react-native-collapsible-header`.
- Native and web edge fades retain the proven visual, accessibility, and pointer-event behavior.
- Package, repository, publication, and packed-tarball consumer checks pass.
- No Budgie-specific code or committed consumer migration is included.
- No branch is pushed and no pull request is created until explicitly requested.
