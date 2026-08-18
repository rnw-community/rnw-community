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

## Compound header

`CollapsibleHeaderSlot`, `CollapsibleHeaderTitleSlot`, and a second `CollapsibleHeaderSlot` must be direct children of
`CollapsibleHeader` in that order. The title slot must directly contain the expanded title followed by the collapsed
title. Fragments and extra wrapper components are rejected so slot discovery stays deterministic.
Leading and trailing controls are mounted once in a persistent layer while title opacity and pointer-event handoff are
delegated to `@rnw-community/react-native-collapsible-header`.

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

## Edge fades

Native edge fades use Masked View, Expo Linear Gradient, and Expo Blur. They ignore pointer events and accessibility
traversal. Web edge fades use CSS mask images and backdrop filtering; scroll animation changes opacity while blur stays
static. Native defaults use 150-point top and bottom bands, while web defaults use 76-pixel bands.

## Public utilities

`mergeScrollContentInset` composes safe-area and caller chrome padding while retaining consumer styles last.
`useScrollFadeStyle` creates a clamped opacity style from the collapsible-header provider scroll value and therefore
requires a `ScreenChromeProvider` ancestor.

## License

This library is licensed under the [MIT License](./LICENSE.md).
