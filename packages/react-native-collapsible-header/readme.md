# React Native Collapsible Header

A generic, slot-based collapsible header powered by React Native Reanimated. The package animates header geometry and
crossfades caller-owned expanded and collapsed content from a caller-owned scroll value.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-collapsible-header&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-collapsible-header.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-collapsible-header)

## Installation

```bash
yarn add @rnw-community/react-native-collapsible-header react-native-reanimated
```

React Native Reanimated is a peer dependency and must be installed by the host application. Follow the
[official Reanimated setup guide](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/).

- Reanimated 4 applications also install `react-native-worklets` and configure `react-native-worklets/plugin`.
- Reanimated 3 applications configure the legacy `react-native-reanimated/plugin`.

See the official [Reanimated 3 migration guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/migration-from-3.x/)
and [compatibility table](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/) when choosing a
version. This package does not install native Reanimated or Worklets code on behalf of the host application.

## CollapsibleHeader

`CollapsibleHeader` renders caller-owned expanded and collapsed content in animated layers, with optional persistent
content mounted once above both transition layers. It clamps offsets before `collapseStart` to the expanded state and
offsets after `collapseStart + collapseDistance` to the collapsed state. Only the visible transition content layer
receives pointer events; persistent content uses `box-none`.

```tsx
import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from '@rnw-community/react-native-collapsible-header';

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
                collapseDistance={100}
                collapseStart={20}
                expandedContent={<ExpandedAccountSummary />}
                collapsedContent={<CompactAccountSummary />}
                persistentContent={<HeaderActions />}
                motion={{
                    expandedTranslateY: 0,
                    expandedScale: 1,
                    collapsedTranslateY: 0,
                }}
                style={{ paddingTop: safeAreaTop }}
                backgroundStyle={{ backgroundColor: '#fff' }}
            />
            <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} />
        </View>
    );
};
```

Safe-area padding, content layout, colors, typography, and scroll ownership remain the consumer's responsibility. Omit
`collapseStart`, `persistentContent`, and `motion` to keep the original zero-start animation defaults.

## CollapsibleHeaderProps

| Prop                              | Type                                      | Description                                                                         |
| --------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `scrollY`                         | `SharedValue<number>`                     | Caller-owned vertical scroll offset.                                                |
| `expandedContent`                 | `ReactNode`                               | Content visible at the expanded endpoint.                                           |
| `collapsedContent`                | `ReactNode`                               | Content visible at the collapsed endpoint.                                          |
| `persistentContent`               | `ReactNode`                               | Content mounted once above both transition layers for actions or shared chrome.      |
| `expandedHeight`                  | `number`                                  | Positive expanded header height.                                                    |
| `collapsedHeight`                 | `number`                                  | Positive collapsed header height, not greater than `expandedHeight`.                |
| `collapseDistance`                | `number`                                  | Positive scroll distance over which the transition completes.                       |
| `collapseStart`                   | `number`                                  | Optional non-negative scroll offset where collapse begins; defaults to `0`.          |
| `motion`                          | `Partial<CollapsibleHeaderMotionConfig>`  | Optional normalized transition thresholds and endpoint transforms.                   |
| `headerStyle`                     | `StyleProp<ViewStyle>`                    | Style for the height-animated header layer.                                         |
| `backgroundStyle`                 | `StyleProp<ViewStyle>`                    | Style for the background fade layer.                                                |
| `expandedContentContainerStyle`   | `StyleProp<ViewStyle>`                    | Style for the expanded content layer.                                               |
| `collapsedContentContainerStyle`  | `StyleProp<ViewStyle>`                    | Style for the collapsed content layer.                                              |
| `persistentContentContainerStyle` | `StyleProp<ViewStyle>`                    | Style for the persistent content layer mounted above expanded and collapsed content. |

The interface also accepts standard React Native `ViewProps`, except `children`; use the two content slots instead.

## CollapsibleHeaderMotionConfig

Motion progress fields are normalized within the active collapse interval
`[collapseStart, collapseStart + collapseDistance]`. A progress value of `0` maps to the expanded endpoint, and `1` maps
to the collapsed endpoint. Omitted `motion` fields use the defaults below, preserving the original animation behavior.

| Field                            | Default | Description                                                                  |
| -------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `expandedOpacityEndProgress`     | `0.6`   | Progress where expanded content finishes fading from opacity `1` to `0`.     |
| `collapsedOpacityStartProgress`  | `0.5`   | Progress where collapsed content begins fading from opacity `0` to `1`.      |
| `backgroundOpacityStartProgress` | `0.7`   | Progress where the background begins fading from opacity `0` to `1`.         |
| `pointerEventsSwitchProgress`    | `0.5`   | Progress where pointer events move from expanded content to collapsed content. |
| `expandedTranslateY`             | `-20`   | Expanded content translateY at the collapsed endpoint.                       |
| `expandedScale`                  | `0.9`   | Expanded content scale at the collapsed endpoint; must be greater than `0`.  |
| `collapsedTranslateY`            | `10`    | Collapsed content translateY at the fade-in start endpoint.                  |

Opacity progress fields must be between `0` and `1`, and `collapsedOpacityStartProgress` must be less than or equal to
`expandedOpacityEndProgress`. Translation endpoints must be finite numbers.

## Testing consumers

Consumer Jest suites should use Reanimated's official setup:

```js
require('react-native-reanimated').setUpTests();
```

See the [Reanimated testing guide](https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/) for matcher
and timer configuration.

## License

This library is licensed under the [MIT License](./LICENSE.md).
