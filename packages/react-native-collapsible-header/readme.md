# React Native Collapsible Header

A generic, slot-based collapsible header powered by React Native Reanimated. The package animates header geometry and
crossfades caller-owned expanded and collapsed content from a scroll offset it either receives as a prop or wires
automatically through `CollapsibleHeaderProvider`. It works with any vertical scrollable — `ScrollView`, `FlatList`,
`SectionList`, or FlashList — because the only integration contract is a Reanimated `SharedValue` scroll offset.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-collapsible-header&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-collapsible-header.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-collapsible-header)

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-collapsible-header/docs/collapsible-header-demo.gif" alt="Collapsible header demo: crossfade on scroll, snap to endpoint, and overscroll stretch" width="300" />

The demo above is the monorepo's
[example app](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header-example)
(Expo and bare React Native targets) — it exercises provider wiring, snap, overscroll stretch, the progress hook, and
persistent actions, and carries the [Maestro E2E suite](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header-example/e2e)
that validates the header through the accessibility tree.

## Installation

```bash
yarn add @rnw-community/react-native-collapsible-header react-native-reanimated
```

React Native Reanimated is a peer dependency and must be installed by the host application. Follow the
[official Reanimated setup guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/).

- Reanimated 4 applications also install `react-native-worklets` and configure `react-native-worklets/plugin`.
- Reanimated 3 applications configure `react-native-reanimated/plugin`.

See the official [Reanimated 3 migration guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/)
and [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/) when choosing a
version. This package does not install native Reanimated or Worklets code on behalf of the host application.

## React Compiler

The published output is precompiled with the [React Compiler](https://react.dev/learn/react-compiler) targeting
React 18+, so every consumer gets automatically memoized header components — including applications that do not run the
compiler themselves (the compiler never processes `node_modules`, so precompilation is the only way library code
benefits). The `react-compiler-runtime` dependency ships with the package and supports React 18 and 19. The package's
own test suite runs fully compiled with `panicThreshold: 'all_errors'`, so any Rules-of-React violation fails the build
instead of shipping. Reanimated supports the React Compiler from 3.17.2 — the peer floor — and this package uses the
compiler-safe `.get()`/`.set()` shared-value API exclusively.

## Quick start

`CollapsibleHeaderProvider` owns the scroll wiring: the header and the scrollable connect through context, so no manual
`scrollY` plumbing is needed. `useCollapsibleHeaderScroll` hands the scrollable its `onScroll` handler and animated ref.

```tsx
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
    CollapsibleHeader,
    CollapsibleHeaderProvider,
    useCollapsibleHeaderScroll,
} from '@rnw-community/react-native-collapsible-header';

const AccountScrollView = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <Animated.ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} />;
};

const AccountScreen = () => (
    <CollapsibleHeaderProvider>
        <View style={{ flex: 1 }}>
            <CollapsibleHeader
                expandedHeight={156}
                collapsedHeight={40}
                snap
                expandedContent={<ExpandedAccountSummary />}
                collapsedContent={<CompactAccountSummary />}
                persistentContent={<HeaderActions />}
                backgroundStyle={{ backgroundColor: '#fff' }}
            />
            <AccountScrollView />
        </View>
    </CollapsibleHeaderProvider>
);
```

Safe-area padding, content layout, colors, typography, and scroll ownership remain the consumer's responsibility.

### Manual scroll wiring

Pass `scrollY` directly to drive the header from a scroll offset you already own — no provider required. This is also
the escape hatch for scrollables the provider cannot reach.

```tsx
const AccountScreen = () => {
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
                expandedContent={<ExpandedAccountSummary />}
                collapsedContent={<CompactAccountSummary />}
            />
            <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} />
        </View>
    );
};
```

## CollapsibleHeader

`CollapsibleHeader` renders caller-owned expanded and collapsed content in animated layers, with optional persistent
content mounted once above both transition layers. It clamps offsets before `collapseStart` to the expanded state and
offsets after `collapseStart + collapseDistance` to the collapsed state. Only the visible transition layer receives
pointer events and accessibility focus — the hidden layer is removed from the accessibility tree, so screen readers
never announce both layers. Persistent content uses `box-none`.

Content taller than the shrinking header can paint outside it mid-transition; pass
`headerStyle={{ overflow: 'hidden' }}` to clip (clipping also cuts shadows, which is why it is not the default).

## CollapsibleHeaderProps

| Prop                              | Type                                     | Description                                                                            |
| --------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `scrollY`                         | `SharedValue<number>`                    | Caller-owned scroll offset; omit to use the nearest `CollapsibleHeaderProvider`.       |
| `expandedContent`                 | `ReactNode`                              | Content visible at the expanded endpoint.                                              |
| `collapsedContent`                | `ReactNode`                              | Content visible at the collapsed endpoint.                                             |
| `persistentContent`               | `ReactNode`                              | Content mounted once above both transition layers for actions or shared chrome.        |
| `expandedHeight`                  | `number`                                 | Positive expanded header height.                                                       |
| `collapsedHeight`                 | `number`                                 | Positive collapsed header height, not greater than `expandedHeight`.                   |
| `collapseDistance`                | `number`                                 | Scroll distance of the transition; defaults to `expandedHeight - collapsedHeight`.     |
| `collapseStart`                   | `number`                                 | Non-negative scroll offset where collapse begins; defaults to `0`.                     |
| `mode`                            | `'flow' \| 'overlay'`                    | `flow` participates in layout; `overlay` pins the header above the scrollable.         |
| `snap`                            | `boolean`                                | Snaps to the nearest endpoint when scrolling settles mid-transition; needs a provider. |
| `stretchOnOverscroll`             | `boolean`                                | Stretches the header height while the scrollable overscrolls above its top edge.       |
| `motion`                          | `Partial<CollapsibleHeaderMotionConfig>` | Optional normalized transition thresholds and endpoint transforms.                     |
| `headerStyle`                     | `StyleProp<ViewStyle>`                   | Style for the height-animated header layer.                                            |
| `backgroundStyle`                 | `StyleProp<ViewStyle>`                   | Style for the background fade layer.                                                   |
| `expandedContentContainerStyle`   | `StyleProp<ViewStyle>`                   | Style for the expanded content layer.                                                  |
| `collapsedContentContainerStyle`  | `StyleProp<ViewStyle>`                   | Style for the collapsed content layer.                                                 |
| `persistentContentContainerStyle` | `StyleProp<ViewStyle>`                   | Style for the persistent content layer mounted above both transition layers.           |

The interface also accepts standard React Native `ViewProps`, except `children`; use the content slots instead.

## CollapsibleHeaderProvider

Owns the scroll wiring — a `scrollY` shared value, a Reanimated scroll handler, and an animated scroll ref — and shares
it through context. Descendant headers fall back to the provider's `scrollY` when the prop is omitted, and `snap`
requires the provider because snapping drives the registered scrollable via `scrollTo`.

## useCollapsibleHeaderScroll

Returns the provider-owned wiring for attaching a scrollable: `{ scrollY, onScroll, scrollRef }`. Attach `onScroll`
(and `scrollRef` when snapping) to any Reanimated-animated scrollable — `Animated.ScrollView`, `Animated.FlatList`, or
an animated FlashList. Throws when no `CollapsibleHeaderProvider` ancestor exists.

## useCollapsibleHeaderProgress

Returns the collapse progress as a `SharedValue<number>` — `0` fully expanded through `1` fully collapsed — available
to any content rendered inside the header's slots. Drive custom slot animations from it without forking the package:

```tsx
const Avatar = () => {
    const progress = useCollapsibleHeaderProgress();
    const avatarStyle = useAnimatedStyle(() => ({
        transform: [{ scale: interpolate(progress.get(), [0, 1], [1, 0.5]) }],
    }));

    return <Animated.Image source={avatar} style={avatarStyle} />;
};
```

## getCollapsibleHeaderContentInsetStyle

Builds the content-container inset for `overlay` mode: `getCollapsibleHeaderContentInsetStyle(156)` returns
`{ paddingTop: 156 }`. Apply it to the scrollable's `contentContainerStyle` so content starts below the pinned header.
In overlay mode the default `collapseDistance` (`expandedHeight - collapsedHeight`) keeps the content edge exactly
aligned with the shrinking header.

## DefaultCollapsibleHeaderMotionConfig

The baseline motion preset. Spread it when building named presets so omitted fields stay original-compatible:

```ts
const subtleMotion = { ...DefaultCollapsibleHeaderMotionConfig, expandedScale: 1, expandedTranslateY: 0 };
```

## CollapsibleHeaderMotionConfig

Motion progress fields are normalized within the active collapse interval
`[collapseStart, collapseStart + collapseDistance]`. A progress value of `0` maps to the expanded endpoint, and `1` maps
to the collapsed endpoint. Omitted `motion` fields use the defaults below, preserving the original animation behavior.

| Field                            | Default | Description                                                                  |
| -------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `expandedOpacityEndProgress`     | `0.6`   | Progress where expanded content finishes fading from opacity `1` to `0`.     |
| `collapsedOpacityStartProgress`  | `0.5`   | Progress where collapsed content begins fading from opacity `0` to `1`.      |
| `backgroundOpacityStartProgress` | `0.7`   | Progress where the background begins fading from opacity `0` to `1`.         |
| `pointerEventsSwitchProgress`    | `0.5`   | Progress where pointer events and accessibility focus switch between layers. |
| `expandedTranslateY`             | `-20`   | Expanded content translateY at the collapsed endpoint.                       |
| `expandedScale`                  | `0.9`   | Expanded content scale at the collapsed endpoint; must be greater than `0`.  |
| `collapsedTranslateY`            | `10`    | Collapsed content translateY at the fade-in start endpoint.                  |

Opacity progress fields must be between `0` and `1`, and `collapsedOpacityStartProgress` must be less than or equal to
`expandedOpacityEndProgress`. Translation endpoints must be finite numbers.

## CollapsibleHeaderMode

`'flow'` (default) keeps the header in normal layout flow — content below moves as the header height animates.
`'overlay'` pins the header absolutely at the top so the scrollable renders underneath; pair it with
`getCollapsibleHeaderContentInsetStyle` and give the header a `zIndex` via `style` when siblings stack above it.
Overlay mode keeps the per-frame height animation inside the absolutely positioned header subtree instead of re-laying
out the whole screen.

## Recipes

### FlatList / SectionList / FlashList

The header is list-agnostic — attach the provider wiring to any Reanimated-animated list:

```tsx
const TransactionList = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <Animated.FlatList
            ref={scrollRef}
            data={transactions}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};
```

For FlashList, wrap it once with `Animated.createAnimatedComponent(FlashList)` and use the same props.

### react-native-web

The package is plain Reanimated + `View` layers and renders on react-native-web without platform-specific code —
pointer events, accessibility hiding (`aria-hidden`), and transforms all map to their DOM equivalents through
Reanimated's web support.

## Testing consumers

Consumer Jest suites should use Reanimated's official setup:

```js
require('react-native-reanimated').setUpTests();
```

See the [Reanimated testing guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/) for matcher
and timer configuration. Note that the hidden transition layer is removed from the accessibility tree, so React Native
Testing Library queries for content inside it need `{ includeHiddenElements: true }`.

## License

This library is licensed under the [MIT License](./LICENSE.md).
