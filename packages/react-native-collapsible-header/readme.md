# React Native Collapsible Header

A generic, slot-based collapsible header powered by React Native Reanimated. The package animates header geometry and
crossfades caller-owned expanded and collapsed content from a scroll offset it either receives as a prop or wires
automatically through `CollapsibleHeaderProvider`. It works with any vertical scrollable — `ScrollView`, `FlatList`,
`SectionList`, FlashList, or LegendList — because the only integration contract is a Reanimated `SharedValue` scroll
offset.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-collapsible-header)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-collapsible-header&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Freact-native-collapsible-header.svg)](https://www.npmjs.com/package/%40rnw-community%2Freact-native-collapsible-header)

## Use cases

| Hero header                                                                                                                                                                                                                                                                             | Navigation chrome                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-collapsible-header/docs/collapsible-header-demo.gif" alt="Hero header: a balance summary crossfades into a compact row on scroll, with snap and overscroll stretch" width="280" /> | <img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-collapsible-header/docs/settings-header-demo.gif" alt="Navigation chrome: a large settings title collapses into a compact title row between persistent icon buttons" width="280" /> |
| A rich summary (balance, profile, hero) crossfades into a compact row as content scrolls. Persistent actions stay tappable in both states.                                                                                                                                              | A large screen title collapses into a small centered title between persistent leading/trailing icons — the iOS large-title pattern, so the header stops distracting from content.                                                                                                        |

Both come from the monorepo's
[example app](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header-example)
(Expo and bare React Native targets, `src/component/header-demo-screen.tsx` and `src/component/settings-demo-screen.tsx`)
— copy those screens as integration templates. The example also carries the
[Maestro E2E suite](https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header-example/e2e)
that validates the header through the accessibility tree, including the react-native-screens `freezeOnBlur` return case.

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

When a `testID` is set, every layer derives its own: `{testID}-background`, `{testID}-header`, `{testID}-expanded`,
`{testID}-collapsed`, and `{testID}-persistent` (when persistent content exists). Query them in React Native Testing
Library with `{ includeHiddenElements: true }` — the invisible layer is accessibility-hidden by design — or target them
directly from Maestro/Detox flows.

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

The provider also reads Reanimated's `useReducedMotion()` and snaps instantly instead of animating whenever the system
"reduce motion" accessibility setting is on. Nothing is configurable here on purpose: an animated snap is an unrequested
motion the user did not initiate, so it follows the platform setting.

### Snap requires a mounted CollapsibleHeader

The provider owns the snap slot, but a `CollapsibleHeader` fills it: a header rendered with `snap` registers its
geometry (`collapseStart` and `collapseStart + collapseDistance`) into the provider's registry on mount and clears it on
unmount. A provider with no mounted snapping header therefore never snaps — scrolling settles wherever it lands. This is
deliberate: snap endpoints are header geometry, so there is nothing to snap to without a header. Conditionally
unmounting the header (a tab switch, a `freezeOnBlur` screen) turns snapping off for as long as it is gone, and
remounting restores it.

### One provider per scrollable

**Mount a provider per screen, inside the screen — never once around a navigator.** A provider holds exactly one
`scrollY`, one scroll handler, one scroll ref, and one snap slot, so its unit of identity is a single scrollable:

- **Correct**: each screen mounts its own provider. Sibling screens then have fully independent scroll state, so
  scrolling one never moves another's header — including when a screen is frozen by react-native-screens
  `freezeOnBlur` and returned to later.
- **Wrong**: one provider wrapping several screens. They share one `scrollY`, so whichever screen scrolls last drives
  every header, and both screens' snapping headers compete for the same slot.

Several headers **in one screen** may share a provider — they animate from the same offset, which is exactly what you
want for, say, a hero header plus a sticky sub-header. Only one of them may set `snap`: snapping is a property of the
scrollable, not of the header, and a second snapping header registering different geometry throws rather than silently
overriding the first. Passing a `scrollY` prop together with `snap` also throws, because the two scroll sources could
disagree and snap the list without moving the header.

## useCollapsibleHeaderScroll

Returns the provider-owned wiring for attaching a scrollable: `{ scrollY, onScroll, scrollRef }`. Attach `onScroll`
(and `scrollRef` when snapping) to any Reanimated-animated scrollable — `Animated.ScrollView`, `Animated.FlatList`, an
animated `SectionList`, FlashList, or LegendList. Throws when no `CollapsibleHeaderProvider` ancestor exists. See the
[recipes](#recipes) for the per-list wiring.

## CollapsibleHeaderScrollRef

The type of `scrollRef`. It is an `AnimatedRef` that additionally satisfies React's `Ref<T>` for every `T`, so the same
ref attaches to lists whose `ref` prop is a component instance (`Animated.FlatList` → `Ref<FlatList>`), a
`createAnimatedComponent` wrapper, or an imperative handle object (FlashList's `FlashListRef`, LegendList's
`LegendListRef`) — with no cast at the call site. Name it when the scrollable lives in a child component and the ref
travels as a prop:

```tsx
interface TransactionListProps {
    readonly scrollRef: CollapsibleHeaderScrollRef;
    readonly onScroll: ScrollHandlerProcessed;
}

const TransactionList = ({ scrollRef, onScroll }: TransactionListProps) => (
    <AnimatedFlashList ref={scrollRef} onScroll={onScroll} data={transactions} renderItem={renderItem} />
);
```

Snapping resolves the underlying native scrollable from whatever instance the list hands the ref: Reanimated reads
`getScrollableNode()` / `getNativeScrollRef()` when the instance exposes them, which is how handle-based lists stay
snappable. When a list exposes its inner animated `ScrollView` ref separately (LegendList's `refScrollView`), prefer that
prop — it is the most direct target for `scrollTo`.

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
With the default `collapseStart` of `0` and the default `collapseDistance` (`expandedHeight - collapsedHeight`), the
content edge stays exactly aligned with the shrinking header. A positive `collapseStart` breaks that alignment — content
scrolls up while the header still sits at its expanded height, so it slides under the header by `collapseStart` points.
Pass `getCollapsibleHeaderContentInsetStyle(expandedHeight + collapseStart)` when delaying the collapse.

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

### FlatList

`Animated.FlatList` ships with Reanimated — attach the wiring directly:

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

### SectionList

Reanimated has no built-in animated `SectionList`; wrap it once at module scope so the component identity is stable:

```tsx
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Transaction>);

const TransactionSections = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <AnimatedSectionList
            ref={scrollRef}
            sections={sections}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};
```

Replace any JS-thread `onScroll` on the list with this worklet handler — running the header off a JS-thread callback
reintroduces the frame drops the package exists to avoid.

### FlashList

Wrap `FlashList` the same way. Its ref is an imperative handle rather than a component instance, which the ref contract
accepts; snapping still reaches the native scrollable through the handle's `getScrollableNode()`.

```tsx
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Transaction>);

const TransactionList = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <AnimatedFlashList
            ref={scrollRef}
            data={transactions}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};
```

### LegendList

`@legendapp/list` publishes its own Reanimated build. Pass the ref through `refScrollView` — it targets the inner
animated `ScrollView`, the exact view `scrollTo` drives — and keep the list's own `ref` free for imperative calls:

```tsx
import { AnimatedLegendList } from '@legendapp/list/reanimated';

const TransactionList = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <AnimatedLegendList
            refScrollView={scrollRef}
            data={transactions}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};
```

FlashList and LegendList are not dependencies of this package — the ref contract is structural, so nothing needs to be
installed for the types above to line up.

### Any other scrollable

For a list that neither exposes a scrollable-resolving ref nor an inner ScrollView ref, render the animated ScrollView
yourself through `renderScrollComponent` (both FlashList and LegendList support it) and attach `scrollRef` there — or
drop `scrollRef` entirely and keep only `onScroll`, which animates the header while leaving snap off.

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
