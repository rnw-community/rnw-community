# React Native Screen Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the complete generic Budgie screen-chrome system as `@rnw-community/react-native-screen-chrome`, layered on `@rnw-community/react-native-collapsible-header` and retaining native/web edge fades, shared scroll state, compound header slots, safe areas, and collapse snapping.

**Architecture:** `ScreenChromeProvider` owns the animated scroll ref, offset, configuration, color scheme, and snap behavior. Structural components and edge fades consume that context. The compound header extracts direct leading/title/trailing children, mounts controls once through the collapsible package's persistent layer, and maps large/small titles into its expanded/collapsed layers.

**Tech Stack:** TypeScript 5.9, React 19, React Native 0.85.3, React Native Reanimated 4.3.1, React Native Safe Area Context, Expo Blur, Expo Linear Gradient, Masked View, Jest 29, React Native Testing Library, Yarn 4.

---

The canonical extraction source is Budgie commit `2adae1d11`, under `packages/screen-chrome`. Read files with
`git show 2adae1d11:packages/screen-chrome/<path>` so this isolated worktree does not need to move to the newer Budgie
history. Port behavior and public contracts, then adapt file organization, imports, tests, documentation, and package
metadata to RNW Community conventions; do not copy Budgie package metadata or app-specific version pins verbatim.

## File Map

Package setup:

- Create `packages/react-native-screen-chrome/package.json`, Babel/Jest setup, four TypeScript configs, license, changelog, readme, and `AGENTS.md`.
- Modify root `README.md`, `AGENTS.md`, `codecov.yml`, `.github/workflows/pr.yml`, `scripts/publint.sh`, `scripts/smoke-esm.mjs`, `knip.json`, and `yarn.lock`.

Configuration and context:

- Create one-file public entities under `src/enum`, `src/type`, and `src/interface` for color scheme, fade position, colors, mask stops, complete/override config, edge-fade animation/props, and context value.
- Create native/web default constants under `src/constant`.
- Create `src/utils/assert-valid-screen-chrome-config.util.ts` and `src/utils/merge-screen-chrome-config.util.ts`.
- Create context, provider, and public hooks under `src/context`, `src/screen-chrome-provider`, and `src/hook`.

Screen structure and utilities:

- Create `ScreenChromeFrame`, `ScreenChromeContent`, and `ScreenChromeScrollView` with colocated styles/specs.
- Create public `mergeRefs` and `mergeScrollContentInset` utilities with colocated specs.

Visual primitives:

- Create native/web `EdgeFade`, focused hooks, mask/blur utilities, styles, and specs.
- Create compound header marker/slot components, slot extraction utility, styles, and specs.
- Create `src/index.ts` containing only public re-exports.

### Task 1: Scaffold a publishable stacked workspace package

**Files:**

- Create: `packages/react-native-screen-chrome/package.json`
- Create: `packages/react-native-screen-chrome/babel.config.cjs`
- Create: `packages/react-native-screen-chrome/jest.config.cjs`
- Create: `packages/react-native-screen-chrome/jest-setup.cjs`
- Create: `packages/react-native-screen-chrome/tsconfig.json`
- Create: `packages/react-native-screen-chrome/tsconfig.build-esm.json`
- Create: `packages/react-native-screen-chrome/tsconfig.build-cjs.json`
- Create: `packages/react-native-screen-chrome/tsconfig.nodenext-check.json`
- Create: `packages/react-native-screen-chrome/LICENSE.md`
- Modify: `yarn.lock`

- [ ] **Step 1: Create the package manifest with the stacked runtime dependency**

Use the same dual-format export/build scripts as `react-native-collapsible-header` and this dependency shape:

```json
{
    "name": "@rnw-community/react-native-screen-chrome",
    "version": "2.12.10",
    "description": "Composable scroll-driven screen chrome for React Native and React Native Web",
    "sideEffects": false,
    "type": "module",
    "dependencies": {
        "@rnw-community/react-native-collapsible-header": "^2.12.10",
        "@rnw-community/shared": "^2.12.10",
        "react-native-easing-gradient": "^1.1.1"
    },
    "peerDependencies": {
        "@react-native-masked-view/masked-view": ">=0.3.2 <1",
        "expo-blur": ">=15 <58",
        "expo-linear-gradient": ">=14 <58",
        "react": ">=18",
        "react-native": ">=0.72",
        "react-native-reanimated": ">=3.17.2 <5",
        "react-native-safe-area-context": ">=4 <6"
    },
    "engines": { "node": ">=22.0.0" },
    "publishConfig": { "access": "public" }
}
```

Include repository metadata, keywords, `files: ["dist/**/*"]`, conditional import/require exports with condition-local types, `main`, `module`, `types`, and the exact build/test/format/lint scripts used by the collapsible package.

- [ ] **Step 2: Add package-local TypeScript, Babel, and Jest configuration**

Copy the four configuration shapes from `packages/react-native-collapsible-header`, changing only cache/output paths. Configure Reanimated with:

```js
require('react-native-reanimated').setUpTests();
```

Use `react-native-worklets/jest/resolver` and the existing transform-ignore pattern for React Native, Reanimated, and Worklets.

- [ ] **Step 3: Install the workspace and verify package discovery**

Run:

```bash
yarn install
yarn workspace @rnw-community/react-native-screen-chrome test --runInBand
```

Expected: install exits `0`; Jest exits with `No tests found`, proving the new workspace and native test setup load.

- [ ] **Step 4: Commit the package scaffold**

```bash
git add packages/react-native-screen-chrome/package.json packages/react-native-screen-chrome/*.cjs packages/react-native-screen-chrome/tsconfig*.json packages/react-native-screen-chrome/LICENSE.md yarn.lock
git commit -m "build(react-native-screen-chrome): scaffold publishable package"
```

Use the repository's decision trailers and record the install/Jest bootstrap result.

### Task 2: Define and validate configuration and context

**Files:**

- Create: `packages/react-native-screen-chrome/src/enum/color-scheme.enum.ts`
- Create: `packages/react-native-screen-chrome/src/type/edge-fade-position.type.ts`
- Create: `packages/react-native-screen-chrome/src/interface/screen-chrome-color-set.interface.ts`
- Create: `packages/react-native-screen-chrome/src/interface/screen-chrome-mask-stop.interface.ts`
- Create: `packages/react-native-screen-chrome/src/interface/screen-chrome-config.interface.ts`
- Create: `packages/react-native-screen-chrome/src/interface/screen-chrome-config-overrides.interface.ts`
- Create: `packages/react-native-screen-chrome/src/interface/screen-chrome-context-value.interface.ts`
- Create: native/web constants under `src/constant`
- Create: `packages/react-native-screen-chrome/src/utils/merge-screen-chrome-config.util.ts`
- Create: `packages/react-native-screen-chrome/src/utils/assert-valid-screen-chrome-config.util.ts`
- Create: `packages/react-native-screen-chrome/src/context/screen-chrome.context.ts`
- Create: `packages/react-native-screen-chrome/src/hook/use-screen-chrome.hook.ts`
- Test: colocated utility and hook specs

- [ ] **Step 1: Define one public entity per contract file**

Use these exact core contracts:

```ts
export enum ColorSchemeEnum {
    LIGHT = 'light',
    DARK = 'dark',
}
```

```ts
export type EdgeFadePosition = 'top' | 'bottom';
```

```ts
export interface ScreenChromeColorSetInterface {
    readonly solid: string;
    readonly wash: string;
}
```

```ts
export interface ScreenChromeMaskStopInterface {
    readonly color: string;
}
```

The complete config carries `headerHeight`, `topFadeHeight`, `bottomFadeHeight`, `headerBackdropHeight`, `intensity`, `maxBlurIntensity`, `collapseStart`, `smallTitleStart`, `largeTitleEnd`, `collapseEnd`, `scrollEventThrottle`, `snapToCollapse`, scheme-keyed colors, and position-keyed numeric mask stops. The override interface is partial and deep-partial only for `colors` and `maskStops`.

- [ ] **Step 2: Port native and web defaults without Budgie imports**

Preserve the approved values:

```ts
export const SCREEN_CHROME_SHARED_DEFAULT_CONFIG = {
    headerHeight: 64,
    intensity: 50,
    maxBlurIntensity: 52,
    collapseStart: 0,
    smallTitleStart: 40,
    largeTitleEnd: 60,
    collapseEnd: 80,
    scrollEventThrottle: 16,
    snapToCollapse: false,
    colors: {
        [ColorSchemeEnum.LIGHT]: { solid: 'rgba(255,255,255,0.42)', wash: 'rgba(255,255,255,0.08)' },
        [ColorSchemeEnum.DARK]: { solid: 'rgba(0,0,0,0.48)', wash: 'rgba(0,0,0,0.12)' },
    },
};
```

Native adds `topFadeHeight: 150`, `bottomFadeHeight: 150`, and `headerBackdropHeight: 220`; web uses `76`, `76`, and `108`. Preserve the current top/bottom mask-stop records from the approved source.

- [ ] **Step 3: Write failing merge and validation tests**

Assert that partial scalar overrides replace defaults, nested color/mask overrides merge without deleting sibling schemes/stops, source objects remain unchanged, and invalid values throw exact property-specific messages.

Cover non-finite/negative heights and intensities, non-positive header height/throttle, missing color strings, mask positions outside `[0, 1]`, an empty mask record, and threshold ordering other than:

```text
collapseStart <= smallTitleStart <= largeTitleEnd <= collapseEnd
```

- [ ] **Step 4: Implement pure merge and validation utilities**

`mergeScreenChromeConfig(overrides)` performs the existing deep merge for both schemes and both fade positions. `assertValidScreenChromeConfig(config)` validates before the provider creates animated handlers. Use `isDefined`, `isNumber`, `isPositiveNumber`, and `isNotEmptyString` from `@rnw-community/shared` where applicable.

- [ ] **Step 5: Create context and missing-provider behavior**

```ts
export const ScreenChromeContext = createContext<ScreenChromeContextValueInterface | null>(null);
```

```ts
export const useScreenChrome = (): ScreenChromeContextValueInterface => {
    const context = useContext(ScreenChromeContext);

    if (!isDefined(context)) {
        throw new Error('useScreenChrome must be used within ScreenChromeProvider');
    }

    return context;
};
```

- [ ] **Step 6: Run focused tests and commit**

Run:

```bash
yarn workspace @rnw-community/react-native-screen-chrome test --runInBand
yarn workspace @rnw-community/react-native-screen-chrome ts
```

Expected: config/context tests pass and TypeScript exits `0`.

Commit with `feat(react-native-screen-chrome): add validated chrome configuration` plus required trailers.

### Task 3: Implement provider-owned scrolling and snapping

**Files:**

- Create: `packages/react-native-screen-chrome/src/screen-chrome-provider/screen-chrome-provider.tsx`
- Create: `packages/react-native-screen-chrome/src/screen-chrome-provider/screen-chrome-provider.spec.tsx`
- Create: `packages/react-native-screen-chrome/src/hook/use-screen-chrome-scroll-handler.hook.ts`
- Create: `packages/react-native-screen-chrome/src/hook/use-scroll-fade-style.hook.ts`

- [ ] **Step 1: Write provider tests before implementation**

Mock Reanimated scroll primitives and assert:

- default light scheme and native config;
- supplied scheme plus deep overrides;
- stable context identity across child-only rerenders;
- one provider-owned animated ref and offset;
- no snap outside or at either endpoint;
- lower/upper midpoint targets inside the interval;
- velocity magnitude `>= 0.05` defers drag-end snapping;
- momentum end performs the deferred snap;
- reduced motion passes `animated=false` to `scrollTo`.

- [ ] **Step 2: Implement the provider with worklet-safe comparisons**

Use `useAnimatedRef<Animated.ScrollView>()`, `useScrollViewOffset`, `useReducedMotion`, and `useAnimatedScrollHandler`. Resolve and validate config before destructuring thresholds. Keep the snap function inside the component and include `'worklet';` as its first statement.

The target rule is:

```ts
const midpoint = (collapseStart + collapseEnd) / 2;
const target = offsetY < midpoint ? collapseStart : collapseEnd;
scrollTo(scrollRef, 0, target, !reducedMotion);
```

- [ ] **Step 3: Implement the public handler and fade hooks**

`useScreenChromeScrollHandler` returns the provider handler unchanged. `useScrollFadeStyle(inputRange, outputRange)` reads `scrollY.get()` and returns clamped animated opacity. Keep input/output tuple types readonly.

- [ ] **Step 4: Run tests and commit**

Run package Jest and TypeScript. Expected: all provider, hook, configuration, and context tests pass.

Commit with `feat(react-native-screen-chrome): coordinate chrome scrolling` plus required trailers.

### Task 4: Add screen structure, safe-area insets, and public utilities

**Files:**

- Create: `src/screen-chrome-frame/*`
- Create: `src/screen-chrome-content/*`
- Create: `src/screen-chrome-scroll-view/*`
- Create: `src/utils/merge-refs.util.ts` and spec
- Create: `src/utils/merge-scroll-content-inset.util.ts` and spec

- [ ] **Step 1: Test ref and inset utilities independently**

For `mergeRefs`, cover object refs, callback refs, null refs, multiple refs, and cleanup values. For `mergeScrollContentInset`, cover all safe-area edges, additive top/bottom custom insets, arrays of consumer styles, and the invariant that a consumer's explicit padding values appear last and therefore win.

- [ ] **Step 2: Implement the utilities**

`mergeRefs(...refs)` returns a callback that writes to every defined callback/object ref. `mergeScrollContentInset(insets, top, bottom, style)` returns:

```ts
[
    {
        paddingTop: insets.top + top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom + bottom,
        paddingLeft: insets.left,
    },
    style,
]
```

- [ ] **Step 3: Test structural components**

Assert `ScreenChromeFrame` uses `flex: 1`, `ScreenChromeContent` fills available space, and `ScreenChromeScrollView` forwards ScrollView props while supplying the provider handler, configured throttle, merged refs, and merged content inset.

- [ ] **Step 4: Implement the structure**

Use `Animated.ScrollView`, `useSafeAreaInsets`, `useMemo`, and the two utilities. Accept `contentInsetTop`, `contentInsetBottom`, and a React 19 `ref` prop while extending `ComponentProps<typeof ScrollView>`.

- [ ] **Step 5: Run tests and commit**

Run package Jest and TypeScript. Commit with `feat(react-native-screen-chrome): add safe area screen structure` plus required trailers.

### Task 5: Port accessible native and web edge fades

**Files:**

- Create native/web `src/edge-fade/edge-fade.tsx` and `edge-fade.web.tsx`
- Create: `src/edge-fade/edge-fade.styles.ts`
- Create: hooks under `src/edge-fade/hook`
- Create: utilities under `src/edge-fade/utils`
- Create: `src/interface/edge-fade-props.interface.ts`
- Create: `src/interface/edge-fade-scroll-animation.interface.ts`
- Create: `src/interface/web-edge-fade-style.interface.ts`
- Test: colocated native/web component, hook, and utility specs

- [ ] **Step 1: Define edge-fade contracts**

`EdgeFadePropsInterface` extends `ViewProps` without `children` and adds required `position`, optional `height`, `intensity`, `scrollAnimation`, and native `blurMethod`. `EdgeFadeScrollAnimationInterface` exposes optional readonly opacity/intensity ranges and `maxIntensity`.

- [ ] **Step 2: Write pure utility tests**

Cover top/bottom band metrics, ordered mask stops, easing-gradient output, light/dark blur tint, and web backdrop-filter strings. Assert custom height/intensity overrides do not mutate provider configuration.

- [ ] **Step 3: Write native component tests**

Mock Masked View, Blur View, Linear Gradient, and animated props. Assert layer order, position, height, wash/solid colors, blur intensity, scroll-driven opacity/intensity, `pointerEvents="none"`, and all native accessibility-hiding properties.

- [ ] **Step 4: Implement native EdgeFade**

Port the proven alpha-mask composition using `@react-native-masked-view/masked-view`, `expo-blur`, `expo-linear-gradient`, and `react-native-easing-gradient`. Keep the blur and gradient decorative and non-interactive.

- [ ] **Step 5: Write and implement web behavior**

Assert `aria-hidden`, CSS `backdropFilter`/`WebkitBackdropFilter`, mask image, static blur radius, and scroll-driven opacity only. Implement in `edge-fade.web.tsx` without importing native-only modules.

- [ ] **Step 6: Run tests and commit**

Run Jest, TypeScript, NodeNext TypeScript, and lint for the package. Commit with `feat(react-native-screen-chrome): add progressive edge fades` plus required trailers.

### Task 6: Compose the compound header through the collapsible package

**Files:**

- Create: `src/collapsible-header/collapsible-header.tsx`, styles, and spec
- Create: leading, trailing, title-slot, large-title, small-title, backdrop, and private slot components/styles
- Create: `src/utils/get-collapsible-header-slots.util.ts` and spec
- Create: internal `src/interface/collapsible-header-slots.interface.ts`

- [ ] **Step 1: Write direct-child extraction tests**

Given the documented compound tree, assert the utility returns exactly one leading slot, one title slot containing one large and one small title, and one trailing slot. Reject duplicate/missing title layers with descriptive errors. Reject fragments or wrapper components with `CollapsibleHeader slots must be direct children` rather than recursively guessing consumer intent.

- [ ] **Step 2: Implement marker components and slot extraction**

Leading/trailing/title/large/small components remain exported React components with their existing child/style contracts. `getCollapsibleHeaderSlots(children)` uses `Children.toArray`, `isValidElement`, and exact component identity to produce:

```ts
interface CollapsibleHeaderSlotsInterface {
    readonly leading: ReactNode;
    readonly expandedTitle: ReactNode;
    readonly collapsedTitle: ReactNode;
    readonly trailing: ReactNode;
}
```

The compound contract supports only direct children, as documented in the approved design.

- [ ] **Step 3: Write the header delegation test before implementation**

Mock `@rnw-community/react-native-collapsible-header` and assert Screen Chrome passes:

```tsx
scrollY={context.scrollY}
expandedHeight={config.headerHeight}
collapsedHeight={config.headerHeight}
collapseStart={config.collapseStart}
collapseDistance={config.collapseEnd - config.collapseStart}
expandedContent={expandedTitle}
collapsedContent={collapsedTitle}
persistentContent={persistentLeadingAndTrailingRow}
motion={{
    expandedOpacityEndProgress: (config.largeTitleEnd - config.collapseStart) / collapseDistance,
    collapsedOpacityStartProgress: (config.smallTitleStart - config.collapseStart) / collapseDistance,
    backgroundOpacityStartProgress: 1,
    pointerEventsSwitchProgress: 0.5,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedTranslateY: 0,
}}
```

Assert leading and trailing test components mount exactly once and retain their press handlers at expanded, midpoint, and collapsed offsets.

- [ ] **Step 4: Implement `CollapsibleHeader` with safe-area ownership**

Alias the dependency import as `GenericCollapsibleHeader`. Add `paddingTop: insets.top` to the outer style; keep the animated header height equal at both endpoints. Build one persistent row containing leading and trailing slots separated by the flexible title region. Place expanded/collapsed titles in the same title region through container styles. Do not recreate interpolation or pointer-event worklets locally.

- [ ] **Step 5: Implement `CollapsibleHeaderBackdrop`**

Return a top `EdgeFade` with `headerBackdropHeight`, opacity range `[collapseStart, smallTitleStart]`, and intensity range `[collapseStart, collapseEnd]`.

- [ ] **Step 6: Run tests and commit**

Run package Jest, coverage, TypeScript, NodeNext TypeScript, and lint. Expected: the compound API passes, controls mount once, and no local title interpolation remains.

Commit with `feat(react-native-screen-chrome): compose collapsible chrome header` plus required trailers.

### Task 7: Publish the API and integrate repository automation

**Files:**

- Create: `packages/react-native-screen-chrome/src/index.ts`
- Create/modify: package `readme.md`, `CHANGELOG.md`, `AGENTS.md`
- Modify: root `README.md`, `AGENTS.md`, `codecov.yml`, `.github/workflows/pr.yml`, `scripts/publint.sh`, `scripts/smoke-esm.mjs`, `knip.json`

- [ ] **Step 1: Export the approved surface without foreign type re-exports**

Export every package-owned component, hook, enum, interface, type, and public utility listed in the design. Do not re-export `CollapsibleHeaderProps`, Reanimated types, React Native types, safe-area types, or Expo types.

- [ ] **Step 2: Add scoped TSDoc and consumer documentation**

Every public export receives the repository's one-sentence plus `@see` TSDoc. The readme documents install/peer setup, frame paint order, provider/config, edge fades, compound direct-child constraints, safe areas, snapping, native/web differences, and one complete example.

- [ ] **Step 3: Wire root discovery, CI, coverage, and publication scripts**

Add the package to the root package list, AGENTS architecture list, Codecov flag, affected coverage upload job, `publint`, packed ESM/CommonJS smoke, and Knip workspace configuration following `react-native-collapsible-header` exactly.

- [ ] **Step 4: Run full package gates**

Run:

```bash
yarn workspace @rnw-community/react-native-screen-chrome format
yarn workspace @rnw-community/react-native-screen-chrome ts
yarn workspace @rnw-community/react-native-screen-chrome ts:nodenext
yarn workspace @rnw-community/react-native-screen-chrome lint
yarn workspace @rnw-community/react-native-screen-chrome test:coverage --runInBand
yarn workspace @rnw-community/react-native-screen-chrome build
```

Expected: all commands exit `0` and coverage is at least 99.9% in every configured dimension.

- [ ] **Step 5: Run repository gates**

Run:

```bash
yarn ts
yarn lint
yarn test
yarn publint
yarn smoke:esm
yarn deadcode
yarn cpd
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 6: Commit package documentation and repository integration**

Commit with `docs(react-native-screen-chrome): document package integration` plus required decision trailers.

### Task 8: Verify both packed packages in Budgie

**Files:**

- Temporary only: a new Budgie worktree outside both repositories
- No committed Budgie files

- [ ] **Step 1: Pack both exact branch artifacts**

Build and pack `@rnw-community/react-native-collapsible-header` and `@rnw-community/react-native-screen-chrome`. Record tarball names and integrity hashes. Inspect each archive and verify Screen Chrome contains a runtime dependency on the collapsible package but neither archive bundles React Native, Reanimated, or native peer code.

- [ ] **Step 2: Install both tarballs into an isolated Budgie worktree**

Replace `@budgie/screen-chrome` with the Screen Chrome tarball and resolve its collapsible dependency to the exact local collapsible tarball. Update imports only in the temporary worktree. Run Budgie's TypeScript validation before starting Metro.

- [ ] **Step 3: Build and launch the iOS development app**

Use the explicit iPhone 17 Pro simulator UDID, an unoccupied Metro port, and the workspace's supported Node runtime. Confirm Metro resolves both package names from the tarballs and the foreground bundle ID is the Budgie development app.

- [ ] **Step 4: Run the Maestro smoke flow**

Exercise expanded, intermediate, and collapsed titles; leading/trailing taps; top/bottom edge fades; rapid scroll/overscroll; navigation away/back; collapse snapping; and an overlay/menu compositing check. Capture screenshots for expanded and collapsed states and retain the Maestro result log.

- [ ] **Step 5: Review runtime output**

Confirm there are no red screens, worklet errors, duplicate-Reanimated warnings, layout oscillation, transparent-window compositing, or package-origin exceptions. Existing unrelated Expo Router warnings are recorded separately and do not count as package failures.

- [ ] **Step 6: Final local branch audit**

Run:

```bash
git merge-base --is-ancestor codex/react-native-collapsible-header codex/react-native-screen-chrome
git diff --stat codex/react-native-collapsible-header...codex/react-native-screen-chrome
git status --short --branch
```

Expected: ancestry exits `0`; the stacked diff contains only Screen Chrome design/plan/package work; the worktree is clean. Stop temporary simulator helpers. Keep both branches local and do not create pull requests.
