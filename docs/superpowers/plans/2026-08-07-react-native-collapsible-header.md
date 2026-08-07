# React Native Collapsible Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a publishable `@rnw-community/react-native-collapsible-header` package that turns a caller-owned Reanimated scroll value into a generic expanded-to-collapsed header transition.

**Architecture:** The public component accepts caller-owned content, geometry, styles, standard `ViewProps`, and a Reanimated `SharedValue<number>`. It owns four UI-thread animated layers: header height, background, expanded content, and collapsed content. React, React Native, and Reanimated remain peer-owned by the consuming app; tests use the official Reanimated Jest setup and React Native Testing Library.

**Tech Stack:** TypeScript 5.9, React 19, React Native 0.85.3, React Native Reanimated 4.3.1 for development with a Reanimated 3.17.2–4.x peer range, Jest 29, React Native Testing Library, Yarn 4, Turbo, Lerna.

---

## File Map

New package files:

- `packages/react-native-collapsible-header/package.json` — npm metadata, peer dependencies, and package commands.
- `packages/react-native-collapsible-header/{babel.config.cjs,jest.config.cjs,jest-setup.cjs}` — React Native and Reanimated test setup.
- `packages/react-native-collapsible-header/tsconfig*.json` — workspace, ESM, CJS, and NodeNext checks.
- `packages/react-native-collapsible-header/src/interface/collapsible-header-props.interface.ts` — public prop contract.
- `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx` — generic animated component and private geometry validation.
- `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx` — rendering, validation, animation, clamping, styles, and pointer-event coverage.
- `packages/react-native-collapsible-header/src/index.ts` — public exports.
- `packages/react-native-collapsible-header/{readme.md,AGENTS.md,LICENSE.md,CHANGELOG.md}` — consumer and maintainer documentation.

Repository integration files:

- `README.md` and `AGENTS.md` — list and describe the new package.
- `codecov.yml` and `.github/workflows/pr.yml` — package-specific coverage status and upload.
- `scripts/publint.sh` and `scripts/smoke-esm.mjs` — publication and dual-module resolution checks.
- `yarn.lock` — resolved test and Reanimated development dependencies.

No Budgie file is committed. A separate temporary Budgie worktree is used only for the packed-tarball simulator smoke test.

### Task 1: Scaffold the publishable package and test runtime

**Files:**

- Create: `packages/react-native-collapsible-header/package.json`
- Create: `packages/react-native-collapsible-header/babel.config.cjs`
- Create: `packages/react-native-collapsible-header/jest.config.cjs`
- Create: `packages/react-native-collapsible-header/jest-setup.cjs`
- Create: `packages/react-native-collapsible-header/tsconfig.json`
- Create: `packages/react-native-collapsible-header/tsconfig.build-esm.json`
- Create: `packages/react-native-collapsible-header/tsconfig.build-cjs.json`
- Create: `packages/react-native-collapsible-header/tsconfig.nodenext-check.json`
- Modify: `yarn.lock`

- [ ] **Step 1: Create the package manifest**

Use the repository's dual-format package shape and keep native dependencies peer-owned:

```json
{
    "name": "@rnw-community/react-native-collapsible-header",
    "version": "2.12.10",
    "description": "Generic Reanimated collapsible header for React Native",
    "keywords": ["react", "react-native", "react-native-web", "reanimated", "collapsible header"],
    "repository": {
        "type": "git",
        "url": "https://github.com/rnw-community/rnw-community.git",
        "directory": "packages/react-native-collapsible-header"
    },
    "license": "MIT",
    "sideEffects": false,
    "type": "module",
    "exports": {
        ".": {
            "import": {
                "types": "./dist/esm/index.d.ts",
                "default": "./dist/esm/index.js"
            },
            "require": {
                "types": "./dist/cjs/index.d.ts",
                "default": "./dist/cjs/index.js"
            }
        }
    },
    "main": "dist/cjs/index.js",
    "module": "dist/esm/index.js",
    "types": "dist/esm/index.d.ts",
    "files": ["dist/**/*"],
    "scripts": {
        "build": "yarn build:esm && yarn build:cjs && rm -rf ./dist/*/*.tsbuildinfo && echo '{\"type\":\"module\"}' > dist/esm/package.json && echo '{\"type\":\"commonjs\"}' > dist/cjs/package.json",
        "build:cjs": "run -T tsc --pretty -p tsconfig.build-cjs.json",
        "build:esm": "run -T tsc --pretty -p tsconfig.build-esm.json",
        "clear": "rm -rf coverage && rm -rf dist && rm -f *.tsbuildinfo",
        "clear:deps": "rm -rf ./node_modules && rm -rf ./dist",
        "format": "run -T prettier --write \"./src/**/*.{ts,tsx}\"",
        "lint": "run -T eslint src",
        "lint:fix": "run -T eslint --fix src",
        "test": "run -T jest",
        "test:coverage": "run -T jest --coverage",
        "ts": "run -T tsc --pretty -p tsconfig.json",
        "ts:nodenext": "run -T tsc --pretty -p tsconfig.nodenext-check.json"
    },
    "devDependencies": {
        "@babel/core": "^7.29.7",
        "@react-native/jest-preset": "0.85.3",
        "@react-native/metro-config": "0.85.3",
        "@testing-library/react-native": "^13.3.3",
        "@types/react": "^19.2.0",
        "@types/react-test-renderer": "^19.1.0",
        "react": "^19.2.3",
        "react-native": "0.85.3",
        "react-native-reanimated": "4.3.1",
        "react-native-worklets": "0.8.3",
        "react-test-renderer": "^19.2.3"
    },
    "dependencies": {
        "@rnw-community/shared": "^2.12.10"
    },
    "peerDependencies": {
        "react": ">=18",
        "react-native": ">=0.72",
        "react-native-reanimated": ">=3.17.2 <5"
    },
    "engines": { "node": ">=22.0.0" },
    "publishConfig": { "access": "public" }
}
```

- [ ] **Step 2: Add build and type-check configuration**

Use the same four configs as `packages/platform`, changing only the package-local cache/output paths:

```json
// tsconfig.json
{
    "extends": "../../tsconfig.json",
    "compilerOptions": { "tsBuildInfoFile": "./node_modules/.cache/tsbuildinfo.json" },
    "include": ["./src"],
    "exclude": ["node_modules", "dist"]
}
```

```json
// tsconfig.build-esm.json
{
    "extends": "../../tsconfig.build-esm.json",
    "compilerOptions": { "outDir": "./dist/esm" },
    "include": ["./src"],
    "exclude": ["node_modules", "dist", "**/*.spec.*"]
}
```

```json
// tsconfig.build-cjs.json
{
    "extends": "../../tsconfig.build-cjs.json",
    "compilerOptions": { "outDir": "./dist/cjs" },
    "include": ["./src"],
    "exclude": ["node_modules", "dist", "**/*.spec.*"]
}
```

```json
// tsconfig.nodenext-check.json
{
    "extends": "./tsconfig.build-esm.json",
    "compilerOptions": {
        "noEmit": true,
        "tsBuildInfoFile": "./node_modules/.cache/tsbuildinfo-nodenext.json"
    },
    "include": ["./src"],
    "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Add Babel and Jest configuration using the official Reanimated setup**

```js
// babel.config.cjs
module.exports = {
    presets: ['module:@react-native/babel-preset'],
    plugins: ['react-native-worklets/plugin'],
};
```

```js
// jest-setup.cjs
require('react-native-reanimated').setUpTests();
```

```js
// jest.config.cjs
module.exports = {
    ...require('../../get-jest.config.js')('react-native-collapsible-header', '@react-native/jest-preset'),
    resolver: 'react-native-worklets/jest/resolver',
    setupFilesAfterEnv: ['<rootDir>/jest-setup.cjs'],
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated|react-native-worklets)/)',
    ],
};
```

- [ ] **Step 4: Resolve the workspace and verify Jest starts**

Run: `yarn install`

Expected: the workspace is detected, `yarn.lock` includes the new development dependencies, and install exits 0.

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: exit 1 with `No tests found`; this proves the package command and Jest setup load before production code exists.

### Task 2: Define the public contract and render caller-owned slots

**Files:**

- Create: `packages/react-native-collapsible-header/src/interface/collapsible-header-props.interface.ts`
- Create: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx`
- Create: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx`
- Create: `packages/react-native-collapsible-header/src/index.ts`

- [ ] **Step 1: Write the failing slot-rendering and prop-forwarding tests**

Start the spec with a small subject that creates a real shared value and caller-owned marker styles:

```tsx
import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header.js';

const Subject = ({ scrollOffset = 0 }: { readonly scrollOffset?: number }) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            accessibilityLabel="Account summary"
            testID="collapsible-header"
            style={{ paddingTop: 24 }}
            scrollY={scrollY}
            expandedHeight={156}
            collapsedHeight={40}
            collapseDistance={100}
            expandedContent={<Text testID="expanded-content">Expanded</Text>}
            collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
        />
    );
};

describe('CollapsibleHeader', () => {
    it('renders caller-owned expanded and collapsed content', () => {
        expect.hasAssertions();
        const { getByTestId } = render(<Subject />);

        expect(getByTestId('expanded-content')).toBeOnTheScreen();
        expect(getByTestId('collapsed-content')).toBeOnTheScreen();
    });

    it('forwards standard view properties and outer style', () => {
        expect.hasAssertions();
        const { getByTestId } = render(<Subject />);
        const root = getByTestId('collapsible-header');

        expect(root).toHaveProp('accessibilityLabel', 'Account summary');
        expect(root).toHaveStyle({ paddingTop: 24 });
    });
});
```

- [ ] **Step 2: Run the test and verify the RED state**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: FAIL because `./collapsible-header.js` does not exist.

- [ ] **Step 3: Add the public props interface**

```ts
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Configures the geometry, content, and layer styling of a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprops
 */
export interface CollapsibleHeaderProps extends Omit<ViewProps, 'children'> {
    readonly scrollY: SharedValue<number>;
    readonly expandedContent: ReactNode;
    readonly collapsedContent: ReactNode;
    readonly expandedHeight: number;
    readonly collapsedHeight: number;
    readonly collapseDistance: number;
    readonly headerStyle?: StyleProp<ViewStyle>;
    readonly backgroundStyle?: StyleProp<ViewStyle>;
    readonly expandedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly collapsedContentContainerStyle?: StyleProp<ViewStyle>;
}
```

- [ ] **Step 4: Implement only the static slot hierarchy needed by the tests**

```tsx
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';

const styles = StyleSheet.create({
    background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    header: { position: 'relative' },
    content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});

/**
 * Renders caller-owned expanded and collapsed content inside an animated header shell.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheader
 */
export const CollapsibleHeader = (props: CollapsibleHeaderProps) => {
    const {
        expandedContent,
        collapsedContent,
        scrollY: _scrollY,
        expandedHeight,
        collapsedHeight: _collapsedHeight,
        collapseDistance: _collapseDistance,
        headerStyle,
        backgroundStyle,
        expandedContentContainerStyle,
        collapsedContentContainerStyle,
        style,
        ...viewProps
    } = props;

    return (
        <View {...viewProps} style={style}>
            <Animated.View pointerEvents="none" style={[styles.background, backgroundStyle]} />
            <Animated.View style={[styles.header, { height: expandedHeight }, headerStyle]}>
                <Animated.View style={[styles.content, collapsedContentContainerStyle]}>{collapsedContent}</Animated.View>
                <Animated.View style={[styles.content, expandedContentContainerStyle]}>{expandedContent}</Animated.View>
            </Animated.View>
        </View>
    );
};
```

Add the public barrel:

```ts
export { CollapsibleHeader } from './collapsible-header/collapsible-header.js';
export type { CollapsibleHeaderProps } from './interface/collapsible-header-props.interface.js';
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: 2 tests pass with no warnings or open handles.

### Task 3: Reject invalid geometry through the public component

**Files:**

- Modify: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx`
- Modify: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx`

- [ ] **Step 1: Add one failing test per geometry invariant**

Refactor `Subject` to accept overrides, then add:

```tsx
it.each([
    ['expandedHeight', { expandedHeight: 0 }, 'expandedHeight must be greater than zero'],
    ['collapsedHeight', { collapsedHeight: 0 }, 'collapsedHeight must be greater than zero'],
    ['collapseDistance', { collapseDistance: 0 }, 'collapseDistance must be greater than zero'],
    [
        'height order',
        { expandedHeight: 39, collapsedHeight: 40 },
        'expandedHeight must be greater than or equal to collapsedHeight',
    ],
])('rejects invalid %s geometry', (_name, overrides, message) => {
    expect.hasAssertions();

    expect(() => render(<Subject {...overrides} />)).toThrow(message);
});
```

The test-only `Subject` props use `Partial<Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance'>>` and default each value before JSX.

- [ ] **Step 2: Run the test and verify RED**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: all four table rows fail because invalid geometry currently renders.

- [ ] **Step 3: Add private validation before the animated hooks**

```ts
const assertValidGeometry = (expandedHeight: number, collapsedHeight: number, collapseDistance: number) => {
    if (!isPositiveNumber(expandedHeight)) {
        throw new Error('expandedHeight must be greater than zero');
    }
    if (!isPositiveNumber(collapsedHeight)) {
        throw new Error('collapsedHeight must be greater than zero');
    }
    if (!isPositiveNumber(collapseDistance)) {
        throw new Error('collapseDistance must be greater than zero');
    }
    if (expandedHeight < collapsedHeight) {
        throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
    }
};
```

Import `isPositiveNumber` from `@rnw-community/shared`. Destructure `collapsedHeight` and `collapseDistance`, then call
`assertValidGeometry(expandedHeight, collapsedHeight, collapseDistance)` before returning JSX.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: 6 tests pass.

### Task 4: Implement and prove the scroll-driven animation preset

**Files:**

- Modify: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.spec.tsx`
- Modify: `packages/react-native-collapsible-header/src/collapsible-header/collapsible-header.tsx`

- [ ] **Step 1: Add failing endpoint and clamping tests**

Pass distinctive marker styles for all internal layers so tests can locate them without adding test-only public props. Use `UNSAFE_getAllByType(View)` to select the node whose resolved style contains the corresponding marker. Add cases for offsets `-20`, `0`, `100`, and `140` asserting the flattened styles:

```tsx
expect(StyleSheet.flatten(header.style)).toMatchObject({ height: expectedHeight });
expect(StyleSheet.flatten(background.style)).toMatchObject({ opacity: expectedBackgroundOpacity });
expect(StyleSheet.flatten(expanded.style)).toMatchObject({
    opacity: expectedExpandedOpacity,
    transform: [{ translateY: expectedExpandedTranslateY }, { scale: expectedExpandedScale }],
});
expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
    opacity: expectedCollapsedOpacity,
    transform: [{ translateY: expectedCollapsedTranslateY }],
});
```

Offsets below zero must match the expanded state. Offsets beyond 100 must match the collapsed state.

- [ ] **Step 2: Run the endpoint tests and verify RED**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: FAIL because only the static expanded height exists and no opacity/transform styles exist.

- [ ] **Step 3: Add UI-thread animated styles using Reanimated 3/4-compatible APIs**

Import `Extrapolation`, `interpolate`, `useAnimatedProps`, and `useAnimatedStyle`. Use `scrollY.get()` in every worklet:

```tsx
const expandedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, collapseDistance * 0.6], [1, 0], Extrapolation.CLAMP),
    transform: [
        { translateY: interpolate(scrollY.get(), [0, collapseDistance], [0, -20], Extrapolation.CLAMP) },
        { scale: interpolate(scrollY.get(), [0, collapseDistance], [1, 0.9], Extrapolation.CLAMP) },
    ],
}));

const collapsedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [collapseDistance * 0.5, collapseDistance], [0, 1], Extrapolation.CLAMP),
    transform: [
        {
            translateY: interpolate(scrollY.get(), [collapseDistance * 0.5, collapseDistance], [10, 0], Extrapolation.CLAMP),
        },
    ],
}));

const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [collapseDistance * 0.7, collapseDistance], [0, 1], Extrapolation.CLAMP),
}));

const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.get(), [0, collapseDistance], [expandedHeight, collapsedHeight], Extrapolation.CLAMP),
}));
```

Compose package styles first, caller overrides second, and animated styles last so animation-owned properties cannot be accidentally disabled.

- [ ] **Step 4: Run endpoint tests and verify GREEN**

Run: `yarn workspace @rnw-community/react-native-collapsible-header test --runInBand`

Expected: endpoint and clamping cases pass.

- [ ] **Step 5: Add a failing intermediate-state test**

At offset 75 with geometry 156/40/100, assert:

```tsx
expect(StyleSheet.flatten(header.style)).toMatchObject({ height: 69 });
expect(StyleSheet.flatten(background.style)).toMatchObject({ opacity: 1 / 6 });
expect(StyleSheet.flatten(expanded.style)).toMatchObject({
    opacity: 0,
    transform: [{ translateY: -15 }, { scale: 0.925 }],
});
expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
    opacity: 0.5,
    transform: [{ translateY: 5 }],
});
```

Temporarily change one expectation to an incorrect value, run the focused test, and confirm it fails for that value. Restore the correct expectation and rerun to satisfy the regression-test red/green proof.

- [ ] **Step 6: Keep only the active visual layer interactive**

Add tests at offsets 0 and 100 against each animated layer's resolved `pointerEvents` prop. Expanded content must have `pointerEvents: 'auto'` at 0 and `'none'` at 100; collapsed content must be the inverse.

Verify RED, then add:

```tsx
const expandedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
    pointerEvents: scrollY.get() < collapseDistance * 0.5 ? 'auto' : 'none',
}));
const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
    pointerEvents: scrollY.get() < collapseDistance * 0.5 ? 'none' : 'auto',
}));
```

Pass those values through the two content layers' `animatedProps`.

- [ ] **Step 7: Run coverage, type checks, lint, and build for the package**

Run in order:

```bash
yarn workspace @rnw-community/react-native-collapsible-header test:coverage --runInBand
yarn workspace @rnw-community/react-native-collapsible-header ts
yarn workspace @rnw-community/react-native-collapsible-header ts:nodenext
yarn workspace @rnw-community/react-native-collapsible-header lint
yarn workspace @rnw-community/react-native-collapsible-header build
```

Expected: all commands exit 0; Jest reports at least 99.9% for statements, branches, functions, and lines; both `dist/esm` and `dist/cjs` contain `index.js` and `index.d.ts`.

- [ ] **Step 8: Commit the tested component**

```bash
git add packages/react-native-collapsible-header yarn.lock
git commit -m "feat(react-native-collapsible-header): add generic animated header"
```

### Task 5: Document the package and consumer setup

**Files:**

- Create: `packages/react-native-collapsible-header/readme.md`
- Create: `packages/react-native-collapsible-header/AGENTS.md`
- Create: `packages/react-native-collapsible-header/LICENSE.md`
- Create: `packages/react-native-collapsible-header/CHANGELOG.md`
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Write the consumer README**

Include installation for both supported Reanimated lines:

```bash
yarn add @rnw-community/react-native-collapsible-header react-native-reanimated
```

Explain that Reanimated 4 consumers also install `react-native-worklets` and configure `react-native-worklets/plugin`, while Reanimated 3 consumers follow the legacy `react-native-reanimated/plugin` setup. Link the official setup, migration, compatibility, and Jest pages.

Document every prop and provide a complete example:

```tsx
const scrollY = useSharedValue(0);
const onScroll = useAnimatedScrollHandler(event => {
    scrollY.set(event.contentOffset.y);
});

return (
    <View style={{ flex: 1 }}>
        <CollapsibleHeader
            scrollY={scrollY}
            expandedHeight={156}
            collapsedHeight={40}
            collapseDistance={100}
            expandedContent={<ExpandedAccountSummary />}
            collapsedContent={<CompactAccountSummary />}
            style={{ paddingTop: safeAreaTop }}
            backgroundStyle={{ backgroundColor: '#fff' }}
        />
        <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} />
    </View>
);
```

The README explicitly states that safe-area padding and content styling belong to the consumer, and that the host app—not this package—owns Reanimated's native install and Babel plugin.

- [ ] **Step 2: Add package maintainer docs and legal files**

`AGENTS.md` describes the single component, public interface, four animation layers, peer-dependency rule, package commands, and 99.9% coverage requirement. `LICENSE.md` copies the repository MIT license. `CHANGELOG.md` uses the standard repository header and an `## Unreleased` section containing the initial feature.

- [ ] **Step 3: Add the package to root documentation**

Add `react-native-collapsible-header` under a React Native utilities heading in `README.md`. Update root `AGENTS.md` from 21 to 22 packages and add the package to the package-category inventory with a one-line generic animation description.

- [ ] **Step 4: Format and commit the documentation**

Run:

```bash
yarn exec prettier --write packages/react-native-collapsible-header/readme.md packages/react-native-collapsible-header/AGENTS.md packages/react-native-collapsible-header/CHANGELOG.md README.md AGENTS.md docs/superpowers/specs/2026-08-07-react-native-collapsible-header-design.md docs/superpowers/plans/2026-08-07-react-native-collapsible-header.md
```

Then commit:

```bash
git add packages/react-native-collapsible-header README.md AGENTS.md docs/superpowers
git commit -m "docs(react-native-collapsible-header): document setup and usage"
```

### Task 6: Integrate publication, coverage, and package-manager validation

**Files:**

- Modify: `codecov.yml`
- Modify: `.github/workflows/pr.yml`
- Modify: `scripts/publint.sh`
- Modify: `scripts/smoke-esm.mjs`

- [ ] **Step 1: Register package coverage**

Add `react-native-collapsible-header` project and patch status entries using `target: *target-default`, plus a carry-forward flag scoped to `packages/react-native-collapsible-header/`.

Add this upload step beside the other package uploads in `.github/workflows/pr.yml`:

```yaml
- name: Upload coverage - react-native-collapsible-header
  if: hashFiles('packages/react-native-collapsible-header/coverage/lcov.info') != ''
  uses: codecov/codecov-action@fb8b3582c8e4def4969c97caa2f19720cb33a72f # v7.0.0
  with:
      use_oidc: ${{ !(github.event_name == 'pull_request' && github.event.pull_request.head.repo.fork) }}
      fail_ci_if_error: ${{ !(github.event_name == 'pull_request' && github.event.pull_request.head.repo.fork) }}
      disable_search: true
      files: packages/react-native-collapsible-header/coverage/lcov.info
      flags: react-native-collapsible-header
```

- [ ] **Step 2: Add publication checks**

Add `react-native-collapsible-header` to `scripts/publint.sh`'s package array. Add it to `RESOLUTION_ONLY_PACKAGES` in `scripts/smoke-esm.mjs` because plain Node cannot execute React Native/Reanimated runtime bindings:

```js
{
    pkg: 'react-native-collapsible-header',
    unloadableBecause: "imports React Native and Reanimated runtime bindings that require a native or Metro environment",
},
```

This automatically includes the package in tarball extraction and the extensionless ESM specifier scan.

- [ ] **Step 3: Extend the four-package-manager tarball smoke test**

Update the build and pack steps to include the new package. Add its tarball, `react-native-reanimated`, and `react-native-worklets` to the generated smoke project's dependencies. Import `CollapsibleHeader` and `CollapsibleHeaderProps` in `smoke.ts`, assign a typed `undefined` props variable, and reference both values so shipped types are checked under npm, Yarn, pnpm, and Bun.

Add CJS `require.resolve` and ESM `import.meta.resolve` steps for `@rnw-community/react-native-collapsible-header` beside the existing payments checks.

- [ ] **Step 4: Run focused publication validation**

Run:

```bash
yarn publint
yarn smoke:esm
npm pack --dry-run --json ./packages/react-native-collapsible-header
```

Expected: `publint` and `attw` report no package errors; the comprehensive smoke includes the package as resolution-only; the dry-run tarball contains package metadata plus `dist/esm` and `dist/cjs`, with no specs, coverage, or cache files.

- [ ] **Step 5: Commit repository integration**

```bash
git add codecov.yml .github/workflows/pr.yml scripts/publint.sh scripts/smoke-esm.mjs
git commit -m "ci(react-native-collapsible-header): validate package publication"
```

### Task 7: Run the complete repository verification sequence

**Files:**

- Modify only files changed automatically by approved formatting; inspect before retaining.

- [ ] **Step 1: Run package formatting and the complete package gate**

```bash
yarn workspace @rnw-community/react-native-collapsible-header format
yarn workspace @rnw-community/react-native-collapsible-header test:coverage --runInBand
yarn workspace @rnw-community/react-native-collapsible-header build
yarn workspace @rnw-community/react-native-collapsible-header ts
yarn workspace @rnw-community/react-native-collapsible-header ts:nodenext
yarn workspace @rnw-community/react-native-collapsible-header lint
```

Expected: all commands exit 0 and coverage is at least 99.9% in every category.

- [ ] **Step 2: Run the full RNW Community validation**

Run sequentially and preserve the output summary:

```bash
yarn build
yarn ts
yarn ts:nodenext
yarn lint
yarn test
yarn test:coverage
yarn deadcode
yarn cpd
yarn publint
yarn smoke:esm
```

Run Jest commands outside the restricted sandbox if Watchman cannot access its launch-agent path. Expected: every command exits 0. Existing warning-only lint findings are recorded separately and must not increase.

- [ ] **Step 3: Inspect the final diff and commit any formatter-only corrections**

Run: `git diff --check && git status --short && git diff --stat && git diff master...HEAD`

Expected: no whitespace errors, only intended package/docs/CI files, and no generated `dist`, `coverage`, `.smoke-esm`, or cache artifacts tracked.

If formatting changed tracked files, stage the known formatting targets and commit them with:

```bash
git add packages/react-native-collapsible-header README.md AGENTS.md codecov.yml .github/workflows/pr.yml scripts/publint.sh scripts/smoke-esm.mjs docs/superpowers
git commit -m "style(react-native-collapsible-header): align package formatting"
```

### Task 8: Validate the packed package inside Budgie on iOS

**Files:**

- Temporary only: a detached Budgie worktree outside the RNW Community branch.
- No Budgie changes are committed.

- [ ] **Step 1: Pack the exact package artifact**

Run from RNW Community:

```bash
mkdir -p /tmp/rnw-collapsible-header-artifact
npm pack --silent --pack-destination /tmp/rnw-collapsible-header-artifact ./packages/react-native-collapsible-header
```

Record the generated tarball name and SHA-256 checksum.

- [ ] **Step 2: Create an isolated Budgie consumer worktree**

From the Budgie repository, create a detached temporary worktree at a validated `/tmp/budgie-collapsible-header-smoke-*` path. Install the tarball only in that worktree and do not alter the user's existing Budgie worktree.

- [ ] **Step 3: Adapt Budgie's header only in the temporary worktree**

Replace the local animation wrappers in `packages/app/src/@generic/component/collapsible-header/collapsible-header.tsx` with the package component. Preserve all Budgie formatting, privacy, i18n, selectors, safe-area padding, and `NetWorthAssetChips` as the two slot values:

```tsx
<CollapsibleHeaderChrome
    scrollY={scrollY}
    expandedHeight={156}
    collapsedHeight={40}
    collapseDistance={100}
    style={containerStyle}
    backgroundStyle={backgroundStyle}
    expandedContent={expandedContent}
    collapsedContent={collapsedContent}
/>
```

Alias the import to `CollapsibleHeaderChrome` so Budgie's product component can retain its existing `CollapsibleHeader` name.

- [ ] **Step 4: Verify the consumer build**

Run `yarn ts` in the temporary Budgie worktree.

Expected: TypeScript exits 0 with the packed tarball, proving the package declarations and peer resolution work in a real consumer.

- [ ] **Step 5: Run the iOS simulator smoke test**

Build or reuse the Budgie development client, start Metro from the temporary worktree, and verify:

- the expanded balance header matches the current screen at rest;
- slow and fast scrolling transition continuously without flicker or layout oscillation;
- negative overscroll clamps to the expanded state;
- large scroll offsets clamp to the collapsed state;
- the visible content layer receives touches while the hidden layer does not;
- navigating away and back leaves the header correct;
- safe-area padding remains owned by Budgie.

Capture simulator/version details and at least one screenshot in `/tmp`; do not commit the temporary consumer patch or artifact.

- [ ] **Step 6: Remove the temporary Budgie worktree**

Confirm its exact path and that it contains no wanted user changes, then remove only that temporary worktree through `git worktree remove`. Keep the tarball checksum and smoke-test notes for the PR body.

### Task 9: Review, publish the branch, and open the pull request

**Files:**

- No planned source changes; review fixes are scoped to findings.

- [ ] **Step 1: Request a code review and resolve validated findings**

Use the requesting-code-review workflow against `master...HEAD`. Validate each finding against code and tests, fix valid issues with a focused red/green test, and record concrete evidence when rejecting invalid findings.

- [ ] **Step 2: Run fresh pre-push verification**

At minimum rerun:

```bash
yarn build
yarn ts
yarn ts:nodenext
yarn lint
yarn test
yarn publint
yarn smoke:esm
git diff --check
git status --short --branch
```

Do not claim completion or create the PR unless every required command exits 0. Record any baseline warnings separately.

- [ ] **Step 3: Push and open a ready pull request**

Push `codex/react-native-collapsible-header` to `rnw-community/rnw-community` and open a PR against `master` titled:

```text
feat(react-native-collapsible-header): add animated collapsible header
```

The PR body summarizes the generic API, animation behavior, Reanimated 3/4 compatibility, automated validation, packed-tarball contents, and Budgie iOS smoke evidence. It explicitly states that Budgie-specific UI and safe-area handling are excluded.

- [ ] **Step 4: Follow CI and automated review to a stable handoff**

Wait for required GitHub checks. Read every automated review comment as required by the repository policy. Fix valid findings and reply with the fixing commit; refute invalid findings with file/test evidence. Leave the PR ready for maintainer review only after required checks pass and no actionable review comment is unanswered.
