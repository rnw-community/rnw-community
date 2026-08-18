# React Native Screen Chrome

Composable, safe-area-aware screen chrome for React Native and React Native Web. It paints collapsible titles,
persistent navigation controls, progressive edge fades, and content insets around one scrollable, while all motion,
scroll wiring, and collapse snapping are delegated to
[`@rnw-community/react-native-collapsible-header`](../react-native-collapsible-header/readme.md) and all visible
content and product behavior stay consumer-owned.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-screen-chrome.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-screen-chrome)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-screen-chrome&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)

## Installation

```bash
yarn add @rnw-community/react-native-screen-chrome \
    @rnw-community/react-native-collapsible-header \
    @react-native-masked-view/masked-view \
    expo-blur expo-linear-gradient \
    react-native-reanimated react-native-safe-area-context
```

The native libraries and `@rnw-community/react-native-collapsible-header` are peer dependencies and must be installed
by the host application: the application must resolve exactly one copy of the collapsible header, otherwise its scroll
context has two identities and the chrome components fail to find their provider. Reanimated 4 applications also
install `react-native-worklets` and configure `react-native-worklets/plugin`.

## Complete example

```tsx
import React from 'react';
import { Pressable, Text } from 'react-native';

import {
    CollapsibleHeader,
    CollapsibleHeaderBackdrop,
    CollapsibleHeaderSlot,
    CollapsibleHeaderTitleSlot,
    EdgeFade,
    ScreenChromeFrame,
    ScreenChromeProvider,
    ScreenChromeScrollView,
} from '@rnw-community/react-native-screen-chrome';

export const AccountsScreen = () => (
    <ScreenChromeProvider config={{ snapToCollapse: true }}>
        <ScreenChromeFrame>
            <ScreenChromeScrollView contentInsetTop={96} contentInsetBottom={48}>
                <Text>Consumer-owned content</Text>
            </ScreenChromeScrollView>
            <CollapsibleHeaderBackdrop />
            <EdgeFade position="bottom" />
            <CollapsibleHeader>
                <CollapsibleHeaderSlot>
                    <Pressable accessibilityRole="button">
                        <Text>Back</Text>
                    </Pressable>
                </CollapsibleHeaderSlot>
                <CollapsibleHeaderTitleSlot>
                    <Text>Accounts</Text>
                    <Text>Accounts</Text>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderSlot>
                    <Pressable accessibilityRole="button">
                        <Text>Menu</Text>
                    </Pressable>
                </CollapsibleHeaderSlot>
            </CollapsibleHeader>
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
```

## Structure and paint order

`ScreenChromeProvider` owns the merged and validated configuration plus the color scheme, and mounts a
`CollapsibleHeaderProvider` that owns the scroll offset, scroll handler, animated scroll ref, and snap registry.
`ScreenChromeScrollView` connects that wiring automatically; custom animated scrollables read `onScroll`, `scrollRef`,
and `scrollY` from `useCollapsibleHeaderScroll` (exported by `@rnw-community/react-native-collapsible-header`), while
`useScreenChrome` returns only `{ colorScheme, config }`.

Mount one `ScreenChromeProvider` per scrollable, inside each screen, and never once around a navigator: a provider owns
exactly one scroll offset and one snap slot, so a shared provider makes the last-scrolled screen drive every header.
Several chrome components within one screen share one provider by design.

Render content first, decorative `EdgeFade` and `CollapsibleHeaderBackdrop` layers second, and interactive
`CollapsibleHeader` chrome last. Native blur then samples the content beneath it while controls remain above decorative
layers. `ScreenChromeScrollView` adds safe-area padding and caller-provided content insets; explicit consumer padding in
`contentContainerStyle` remains last and wins.

## CollapsibleHeader

Composes the persistent leading/trailing controls and the expanded/collapsed title layers of its three compound
children into the generic `@rnw-community/react-native-collapsible-header` primitive, reading geometry and thresholds
from `useScreenChrome`.

```tsx
<CollapsibleHeader>
    <CollapsibleHeaderSlot>{/* leading control */}</CollapsibleHeaderSlot>
    <CollapsibleHeaderTitleSlot>
        {/* expanded title */}
        {/* collapsed title */}
    </CollapsibleHeaderTitleSlot>
    <CollapsibleHeaderSlot>{/* trailing control */}</CollapsibleHeaderSlot>
</CollapsibleHeader>
```

## Compound header contract

`CollapsibleHeaderSlot`, `CollapsibleHeaderTitleSlot`, and a second `CollapsibleHeaderSlot` must be direct children of
`CollapsibleHeader` in that order. The title slot must directly contain the expanded title followed by the collapsed
title. Fragments and extra wrapper components are rejected so slot discovery stays deterministic.

The shape above is a compound-component contract that TypeScript's type system cannot express: JSX children are
`ReactNode`, so nothing in the type checker distinguishes three correctly ordered slots from an arbitrary fragment tree
at compile time. `CollapsibleHeader` therefore validates its children at render time and throws a `TypeError` naming the
violated rule (missing slot, wrong slot type, wrong title-layer count) instead of silently mounting a broken layout —
a mispositioned or dropped slot without this check degrades into leading controls rendering as the title, or a header
that mounts with no crash and no visible content. Four spec cases pin the accepted shape and every rejected one.

## CollapsibleHeaderSlot

Renders one persistent leading or trailing control slot in a collapsible header, mounted once above both title
transition layers.

```tsx
<CollapsibleHeaderSlot>
    <Pressable accessibilityRole="button">
        <Text>Back</Text>
    </Pressable>
</CollapsibleHeaderSlot>
```

## CollapsibleHeaderTitleSlot

Groups the direct expanded and collapsed title layers of a compound collapsible header; title opacity and pointer-event
handoff between them are delegated to `@rnw-community/react-native-collapsible-header`.

```tsx
<CollapsibleHeaderTitleSlot>
    <Text>Accounts</Text>
    <Text>Accounts</Text>
</CollapsibleHeaderTitleSlot>
```

## CollapsibleHeaderBackdrop

Renders a top `EdgeFade` sized to `headerBackdropHeight` and aligned with the configured title-collapse thresholds, so
native blur samples the content scrolling beneath the header.

```tsx
<CollapsibleHeaderBackdrop />
```

## Edge fades

Native edge fades use Masked View, Expo Linear Gradient, and Expo Blur. They ignore pointer events and accessibility
traversal. Web edge fades use CSS mask images and backdrop filtering; scroll animation changes opacity while blur stays
static. Native defaults use 150-point top and bottom bands, while web defaults use 76-pixel bands.

## EdgeFade

Renders a decorative top or bottom blur-and-wash band, scroll-animatable through `scrollAnimation`.

```tsx
<EdgeFade position="bottom" height={96} scrollAnimation={{ opacityInputRange: [0, 80] }} />
```

## EdgeFadePropsInterface

| Prop              | Type                               | Description                                                       |
| ----------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `position`        | `EdgeFadePosition`                 | Screen edge the band renders at.                                  |
| `height`          | `number`                           | Band height; defaults to the provider config's fade height.       |
| `intensity`       | `number`                           | Static blur intensity; ignored while `scrollAnimation` drives it. |
| `scrollAnimation` | `EdgeFadeScrollAnimationInterface` | Optional scroll-driven opacity and blur intensity ranges.         |
| `blurMethod`      | `BlurMethod`                       | Native-only Expo Blur rendering method.                           |

## EdgeFadeScrollAnimationInterface

Configures scroll-driven edge-fade opacity and blur intensity.

```ts
const scrollAnimation: EdgeFadeScrollAnimationInterface = {
    opacityInputRange: [0, 80],
    intensityInputRange: [0, 80],
    maxIntensity: 60,
};
```

## EdgeFadePosition

Identifies the screen edge where a fade band is rendered: `'top' | 'bottom'`.

## ScreenChromeFrame

Provides the relative full-screen layout root for content, fades, and header chrome.

```tsx
<ScreenChromeFrame>{children}</ScreenChromeFrame>
```

## ScreenChromeProvider

Provides validated configuration and color scheme to screen chrome components around one scrollable.

```tsx
<ScreenChromeProvider colorScheme="dark" config={{ snapToCollapse: true }}>
    {children}
</ScreenChromeProvider>
```

## ScreenChromeScrollView

Connects an animated scroll view to the collapsible-header scroll wiring and safe-area content padding.

```tsx
<ScreenChromeScrollView contentInsetTop={96} contentInsetBottom={48}>
    <Text>Consumer-owned content</Text>
</ScreenChromeScrollView>
```

## ScreenChromeContext

The React context that carries the resolved screen chrome value to package components and hooks; consumers read it
through `useScreenChrome` rather than `useContext(ScreenChromeContext)` directly.

## useScreenChrome

Reads the nearest `ScreenChromeContext` value and throws when no `ScreenChromeProvider` is mounted.

```tsx
const { colorScheme, config } = useScreenChrome();
```

## useScrollFadeStyle

Creates a clamped opacity style from the collapsible-header provider scroll value and therefore requires a
`ScreenChromeProvider` ancestor.

```tsx
const style = useScrollFadeStyle([0, 80], [1, 0]);
```

## ScreenChromeColorScheme

Selects the light or dark chrome palette for edge fades and backdrop blur tinting: `'light' | 'dark'`. Being a plain
union rather than a string enum, React Native's `useColorScheme()` result assigns to it directly — no cast, no mapping
layer between the platform API and the provider prop.

```tsx
const colorScheme: ScreenChromeColorScheme = useColorScheme() ?? 'light';

<ScreenChromeProvider colorScheme={colorScheme}>{children}</ScreenChromeProvider>;
```

## ScreenChromeColorSetInterface

Defines the solid and translucent wash colors used by a chrome color scheme.

```ts
const lightColors: ScreenChromeColorSetInterface = { solid: 'rgba(255,255,255,0.42)', wash: 'rgba(255,255,255,0.08)' };
```

## ScreenChromeConfigInterface

Configures screen chrome geometry, colors, fade masks, scroll throttling, and collapse thresholds. See
[Configuration and snapping](#configuration-and-snapping) for the threshold ordering rule and
[`ScreenChromeDefaultConfig`](#screenchromedefaultconfig) for the full default shape.

## ScreenChromeConfigOverridesInterface

Overrides selected screen chrome defaults while preserving nested color schemes and mask-stop records; the shape
`ScreenChromeProvider`'s `config` prop accepts.

```tsx
<ScreenChromeProvider config={{ headerHeight: 72, colors: { dark: { solid: 'black' } } }}>{children}</ScreenChromeProvider>
```

## ScreenChromeContextValueInterface

The `{ colorScheme, config }` shape returned by `useScreenChrome`.

## ScreenChromeMaskStopInterface

Defines one color stop in an edge-fade mask.

```ts
const stop: ScreenChromeMaskStopInterface = { color: 'rgba(0,0,0,0.99)' };
```

## Configuration and snapping

Provider overrides deep-merge light/dark colors and top/bottom mask stops. Geometry, blur intensity, throttle, mask
positions, colors, and transition ordering are validated. The required threshold order is
`collapseStart <= smallTitleStart <= largeTitleEnd <= collapseEnd` with a non-zero collapse interval.

Thresholds are mapped to normalized collapse progress and handed to the generic header as its `motion` config, so
`smallTitleStart` and `largeTitleEnd` keep their meaning while the transition itself is owned upstream.

`snapToCollapse` is forwarded to the generic header's `snap` prop, which snaps the scrollable toward the nearest
endpoint once a released scroll holds still for three frames — momentum events are never relied on, because a
worklet-only scroll handler never receives them on Android. Snapping therefore requires a mounted `CollapsibleHeader`:
the header registers the snap geometry with the provider, so a screen that enables `snapToCollapse` without rendering
`CollapsibleHeader` scrolls freely. Snap animation currently ignores the reduced-motion setting.

## ScreenChromeDefaultConfig

The platform default `ScreenChromeConfigInterface`: native (`ScreenChromeDefaultConfig.ts`) uses 150-point top and
bottom fade bands and a 220-point header backdrop; web (`ScreenChromeDefaultConfig.web.ts`) uses 76-pixel bands and a
108-pixel backdrop. `mergeScreenChromeConfig` starts from this value.

## ScreenChromeSharedDefaultConfig

The platform-independent subset of the default configuration — geometry, colors, mask stops, and throttling shared by
the native and web `ScreenChromeDefaultConfig` variants.

## assertValidScreenChromeConfig

Throws a property-specific error when a screen chrome config cannot drive stable scroll animations — non-finite or
negative geometry, an invalid threshold order, a missing color scheme, or an out-of-range mask stop.

```ts
assertValidScreenChromeConfig(mergeScreenChromeConfig({ headerHeight: -1 })); // throws: headerHeight must be a positive finite number
```

`ScreenChromeProvider` calls it before rendering children, so a misconfigured screen fails fast at mount instead of
producing NaN-driven animation glitches once the user starts scrolling.

## mergeScreenChromeConfig

Resolves partial screen chrome overrides into a complete immutable configuration object, deep-merging `colors` and
`maskStops` instead of replacing them wholesale.

```ts
const config = mergeScreenChromeConfig({ colors: { dark: { solid: 'black' } } });
// config.colors.dark.wash and config.colors.light stay at their defaults
```

A naive object spread (`{ ...defaults, ...overrides }`) replaces `colors` and `maskStops` outright when either key is
present in `overrides`, because spread only merges at the top level: overriding one color scheme's `solid` value would
silently delete the untouched scheme along with every other field of the touched one, and overriding one mask edge's
stops would delete the untouched edge entirely. `mergeScreenChromeConfig` merges `colors.light`, `colors.dark`,
`maskStops.top`, and `maskStops.bottom` independently so a caller can override exactly one nested field without
having to restate everything else. Six spec cases pin this: scalar overrides, per-scheme color merges that preserve the
sibling scheme, per-edge mask-stop merges that preserve the sibling edge, immutability of the source defaults and the
caller's own overrides object, and non-sharing of nested mask-stop objects between the merged result and its inputs.

## mergeScrollContentInset

Prepends safe-area and chrome content padding while preserving consumer styles after generated padding.

```ts
const contentContainerStyle = mergeScrollContentInset(insets, 96, 48, { paddingHorizontal: 16 });
```

## Public utilities

`mergeScrollContentInset` composes safe-area and caller chrome padding while retaining consumer styles last.
`useScrollFadeStyle` creates a clamped opacity style from the collapsible-header provider scroll value and therefore
requires a `ScreenChromeProvider` ancestor.

## License

This library is licensed under the [MIT License](./LICENSE.md).
