# React Native Collapsible Header Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the generic collapsible header with a single-mounted persistent layer, a non-zero collapse start, and configurable normalized motion while preserving the existing default behavior.

**Architecture:** Keep `CollapsibleHeader` as the only runtime public component. Add one public motion interface, resolve partial motion overrides against the existing preset, validate geometry and motion before hooks run, and render persistent content once as the topmost header layer. All input ranges are derived from `collapseStart`, `collapseDistance`, and normalized progress values.

**Tech Stack:** TypeScript 5.9, React 19, React Native 0.85.3, React Native Reanimated 3.17.2–4.x, Jest 29, React Native Testing Library, Yarn 4.

---

## File Map

- Create `packages/react-native-collapsible-header/src/interface/collapsible-header-motion-config.interface.ts` for the public normalized motion contract.
- Create `packages/react-native-collapsible-header/src/constant/default-collapsible-header-motion-config.constant.ts` for the current animation preset.
- Create `packages/react-native-collapsible-header/src/utils/resolve-collapsible-header-motion-config.util.ts` for merging partial overrides.
- Create `packages/react-native-collapsible-header/src/utils/assert-valid-collapsible-header-config.util.ts` for geometry and motion validation.
- Modify `packages/react-native-collapsible-header/src/interface/collapsible-header-props.interface.ts` to expose the approved optional APIs.
- Modify `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx` to consume resolved configuration and render persistent content once.
- Modify `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx` for behavior and regression coverage.
- Modify `packages/react-native-collapsible-header/src/index.ts`, `readme.md`, `CHANGELOG.md`, and `AGENTS.md` for the public contract.
- Modify `docs/superpowers/specs/2026-08-07-react-native-collapsible-header-design.md` only if implementation evidence requires a wording correction; the approved extension is already recorded there.

### Task 1: Lock the public extension contract with failing tests

**Files:**

- Create: `packages/react-native-collapsible-header/src/interface/collapsible-header-motion-config.interface.ts`
- Modify: `packages/react-native-collapsible-header/src/interface/collapsible-header-props.interface.ts`
- Modify: `packages/react-native-collapsible-header/src/index.ts`
- Test: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx`

- [ ] **Step 1: Add the public motion interface**

```ts
/**
 * Configures normalized transition thresholds and endpoint transforms for a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheadermotionconfig
 */
export interface CollapsibleHeaderMotionConfig {
    readonly expandedOpacityEndProgress: number;
    readonly collapsedOpacityStartProgress: number;
    readonly backgroundOpacityStartProgress: number;
    readonly pointerEventsSwitchProgress: number;
    readonly expandedTranslateY: number;
    readonly expandedScale: number;
    readonly collapsedTranslateY: number;
}
```

- [ ] **Step 2: Extend `CollapsibleHeaderProps` without changing existing required properties**

Add these imports and properties:

```ts
import type { CollapsibleHeaderMotionConfig } from './collapsible-header-motion-config.interface.js';

readonly persistentContent?: ReactNode;
readonly collapseStart?: number;
readonly motion?: Partial<CollapsibleHeaderMotionConfig>;
readonly persistentContentContainerStyle?: StyleProp<ViewStyle>;
```

- [ ] **Step 3: Export only the package-owned public type**

```ts
export { CollapsibleHeader } from './collapsible-header/collapsible-header.js';
export type { CollapsibleHeaderMotionConfig } from './interface/collapsible-header-motion-config.interface.js';
export type { CollapsibleHeaderProps } from './interface/collapsible-header-props.interface.js';
```

- [ ] **Step 4: Extend the test subject with optional persistent content, collapse start, and motion**

```tsx
interface SubjectProps extends Partial<
    Pick<
        CollapsibleHeaderProps,
        'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart' | 'motion'
    >
> {
    readonly scrollOffset?: number;
    readonly withPersistentContent?: boolean;
}

const persistentContent = <Text testID="persistent-content">Persistent</Text>;

<CollapsibleHeader
    {...existingProps}
    collapseStart={collapseStart}
    motion={motion}
    persistentContent={withPersistentContent ? persistentContent : null}
    persistentContentContainerStyle={{ zIndex: PERSISTENT_LAYER }}
/>
```

- [ ] **Step 5: Add a failing single-mount persistence test**

```tsx
it('renders persistent content once above both transition layers', () => {
    expect.hasAssertions();
    const screen = render(<Subject withPersistentContent />);

    expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
    expect(StyleSheet.flatten(getLayerProps(getLayer(screen, PERSISTENT_LAYER)).style)).toMatchObject({
        zIndex: PERSISTENT_LAYER,
    });
});
```

- [ ] **Step 6: Add a failing custom interval and motion test**

Use `collapseStart={20}`, `collapseDistance={80}`, and:

```ts
const customMotion = {
    expandedOpacityEndProgress: 0.75,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.25,
    pointerEventsSwitchProgress: 0.6,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedTranslateY: 0,
};
```

At scroll offset `60`, assert height `98`, expanded opacity `1 / 3`, collapsed opacity `0`, background opacity `1 / 3`, and zero/identity transforms. At offsets `20` and `100`, assert the exact expanded and collapsed endpoints.

- [ ] **Step 7: Add failing validation cases**

Use table tests for `collapseStart={-1}`, progress values below `0` and above `1`, non-finite transform values, `expandedScale={0}`, and an opacity ordering where `collapsedOpacityStartProgress > expandedOpacityEndProgress`. Assert the exact messages defined in Task 2.

- [ ] **Step 8: Run the focused test and verify RED**

Run:

```bash
yarn workspace @rnw-community/react-native-collapsible-header test --runInBand
```

Expected: FAIL because the component does not yet render persistent content, honor custom motion, or validate the new configuration.

### Task 2: Resolve and validate motion configuration

**Files:**

- Create: `packages/react-native-collapsible-header/src/constant/default-collapsible-header-motion-config.constant.ts`
- Create: `packages/react-native-collapsible-header/src/utils/resolve-collapsible-header-motion-config.util.ts`
- Create: `packages/react-native-collapsible-header/src/utils/assert-valid-collapsible-header-config.util.ts`
- Modify: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx`

- [ ] **Step 1: Encode the current preset as the complete default**

```ts
import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';

export const DEFAULT_COLLAPSIBLE_HEADER_MOTION_CONFIG: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.6,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.7,
    pointerEventsSwitchProgress: 0.5,
    expandedTranslateY: -20,
    expandedScale: 0.9,
    collapsedTranslateY: 10,
};
```

- [ ] **Step 2: Resolve partial overrides without mutating either input**

```ts
import { DEFAULT_COLLAPSIBLE_HEADER_MOTION_CONFIG } from '../constant/default-collapsible-header-motion-config.constant.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';

export const resolveCollapsibleHeaderMotionConfig = (
    motion: Partial<CollapsibleHeaderMotionConfig> | undefined
): CollapsibleHeaderMotionConfig => ({
    ...DEFAULT_COLLAPSIBLE_HEADER_MOTION_CONFIG,
    ...motion,
});
```

- [ ] **Step 3: Add deterministic validation before any animated hook executes**

Implement `assertValidCollapsibleHeaderConfig(expandedHeight, collapsedHeight, collapseStart, collapseDistance, motion)` with these exact failures:

```ts
if (!isPositiveNumber(expandedHeight)) throw new Error('expandedHeight must be greater than zero');
if (!isPositiveNumber(collapsedHeight)) throw new Error('collapsedHeight must be greater than zero');
if (!isNumber(collapseStart) || !Number.isFinite(collapseStart) || collapseStart < 0) {
    throw new Error('collapseStart must be a finite number greater than or equal to zero');
}
if (!isPositiveNumber(collapseDistance)) throw new Error('collapseDistance must be greater than zero');
if (expandedHeight < collapsedHeight) {
    throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
}
```

Validate every progress field with a private `assertProgress` helper and message `<field> must be between zero and one`. Require `collapsedOpacityStartProgress <= expandedOpacityEndProgress`. Require finite translations, `expandedScale > 0`, and emit property-specific messages.

- [ ] **Step 4: Derive all absolute ranges from the collapse interval**

In `CollapsibleHeader`, default `collapseStart` to `0`, resolve motion once, validate it, and derive:

```ts
const collapseEnd = collapseStart + collapseDistance;
const toOffset = (progress: number) => collapseStart + collapseDistance * progress;
const expandedOpacityEnd = toOffset(motionConfig.expandedOpacityEndProgress);
const collapsedOpacityStart = toOffset(motionConfig.collapsedOpacityStartProgress);
const backgroundOpacityStart = toOffset(motionConfig.backgroundOpacityStartProgress);
const pointerEventsSwitchOffset = toOffset(motionConfig.pointerEventsSwitchProgress);
```

Keep `toOffset` component-local because it closes over two values and has one consumer.

- [ ] **Step 5: Replace hardcoded animated endpoints**

Use `[collapseStart, collapseEnd]` for height and transforms, the derived opacity ranges for each layer, and the resolved endpoint transforms:

```ts
opacity: interpolate(scrollY.get(), [collapseStart, expandedOpacityEnd], [1, 0], Extrapolation.CLAMP)
transform: [
    { translateY: interpolate(scrollY.get(), [collapseStart, collapseEnd], [0, motionConfig.expandedTranslateY], Extrapolation.CLAMP) },
    { scale: interpolate(scrollY.get(), [collapseStart, collapseEnd], [1, motionConfig.expandedScale], Extrapolation.CLAMP) },
]
```

Apply the analogous collapsed and background ranges. Use `pointerEventsSwitchOffset` for both animated pointer-event props.

- [ ] **Step 6: Render persistent content once as the topmost header layer**

After the expanded layer, add:

```tsx
{isDefined(persistentContent) ? (
    <View pointerEvents="box-none" style={[styles.content, persistentContentContainerStyle]}>
        {persistentContent}
    </View>
) : null}
```

Import `isDefined` from `@rnw-community/shared`. Do not duplicate `persistentContent` inside the expanded or collapsed layers.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
yarn workspace @rnw-community/react-native-collapsible-header test --runInBand
```

Expected: PASS with all default-regression, persistent-layer, custom-motion, and validation cases green.

- [ ] **Step 8: Commit the behavior extension**

```bash
git add packages/react-native-collapsible-header/src
git commit -m "feat(react-native-collapsible-header): support persistent configurable layers"
```

Use the repository's required decision trailers and record the focused test command.

### Task 3: Document and fully validate PR 1

**Files:**

- Modify: `packages/react-native-collapsible-header/readme.md`
- Modify: `packages/react-native-collapsible-header/CHANGELOG.md`
- Modify: `packages/react-native-collapsible-header/AGENTS.md`

- [ ] **Step 1: Update the readme example and props table**

Add `persistentContent={<HeaderActions />}`, `collapseStart={20}`, and a `motion` example that disables translation and scale. Document that progress values are normalized within `[collapseStart, collapseStart + collapseDistance]` and defaults preserve the original animation.

- [ ] **Step 2: Record the additive API in the changelog and package guide**

Add entries for persistent content, non-zero collapse start, configurable motion, validation, and the guarantee that omitted options preserve existing behavior.

- [ ] **Step 3: Run package validation**

Run:

```bash
yarn workspace @rnw-community/react-native-collapsible-header format
yarn workspace @rnw-community/react-native-collapsible-header ts
yarn workspace @rnw-community/react-native-collapsible-header ts:nodenext
yarn workspace @rnw-community/react-native-collapsible-header lint
yarn workspace @rnw-community/react-native-collapsible-header test:coverage --runInBand
yarn workspace @rnw-community/react-native-collapsible-header build
```

Expected: every command exits `0`; coverage remains at least 99.9% for statements, branches, functions, and lines.

- [ ] **Step 4: Run repository publication gates**

Run:

```bash
yarn publint
yarn smoke:esm
yarn deadcode
yarn cpd
git diff --check
```

Expected: every command exits `0` and the package passes both ESM import and CommonJS require checks.

- [ ] **Step 5: Pack and inspect the exact artifact**

Run the repository's package pack command, list the tarball, and verify it contains only `dist`, license, readme, changelog, and package metadata. Install that tarball in the existing temporary Budgie consumer and rerun its TypeScript check plus the iOS collapsed-header Maestro flow.

Expected: the existing consumer behavior remains unchanged because it omits every new optional property.

- [ ] **Step 6: Commit documentation and verification metadata**

```bash
git add packages/react-native-collapsible-header docs/superpowers/specs/2026-08-07-react-native-collapsible-header-design.md
git commit -m "docs(react-native-collapsible-header): document composable motion"
```

Use the required decision trailers. Do not push or create a pull request.
