# React Native Screen Chrome

Composable, safe-area-aware screen chrome for React Native and React Native Web. It coordinates one scroll value across
collapsible titles, persistent navigation controls, progressive edge fades, content insets, and optional collapse
snapping while leaving all visible content and product behavior to the consumer.

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

The native libraries are peer dependencies and must be configured by the host application. Reanimated 4 applications
also install `react-native-worklets` and configure `react-native-worklets/plugin`.

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
                    <Pressable accessibilityRole="button"><Text>Back</Text></Pressable>
                </CollapsibleHeaderSlot>
                <CollapsibleHeaderTitleSlot>
                    <Text>Accounts</Text>
                    <Text>Accounts</Text>
                </CollapsibleHeaderTitleSlot>
                <CollapsibleHeaderSlot>
                    <Pressable accessibilityRole="button"><Text>Menu</Text></Pressable>
                </CollapsibleHeaderSlot>
            </CollapsibleHeader>
        </ScreenChromeFrame>
    </ScreenChromeProvider>
);
```

## Structure and paint order

`ScreenChromeProvider` owns the animated scroll ref, shared offset, merged configuration, color scheme, reduced-motion
state, and collapse-snap handler. `ScreenChromeScrollView` connects that state automatically; custom animated scroll
views can read `scrollHandler`, `scrollRef`, and `scrollY` from `useScreenChrome` directly.

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

When `snapToCollapse` is enabled, drag end snaps offsets strictly inside the interval toward the nearest endpoint.
Residual momentum defers the decision to momentum end, and reduced-motion users receive an immediate adjustment.

## Edge fades

Native edge fades use Masked View, Expo Linear Gradient, and Expo Blur. They ignore pointer events and accessibility
traversal. Web edge fades use CSS mask images and backdrop filtering; scroll animation changes opacity while blur stays
static. Native defaults use 150-point top and bottom bands, while web defaults use 76-pixel bands.

## Public utilities

`mergeScrollContentInset` composes safe-area and caller chrome padding while retaining consumer styles last.
`useScrollFadeStyle` creates a clamped opacity style from the provider scroll value.

## License

This library is licensed under the [MIT License](./LICENSE.md).
