# React Native Screen Chrome

Composable, safe-area-aware screen chrome for React Native and React Native Web. It paints collapsible titles,
persistent navigation controls, progressive edge fades, and content insets around one scrollable, while all motion,
scroll wiring, and collapse snapping are delegated to
[`@rnw-community/react-native-collapsible-header`](https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-collapsible-header/readme.md) and all visible
content and product behavior stay consumer-owned.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Freact-native-screen-chrome.svg)](https://badge.fury.io/js/%40rnw-community%2Freact-native-screen-chrome)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=react-native-screen-chrome&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)

## Installation

```bash
npm install @rnw-community/react-native-screen-chrome \
    @rnw-community/react-native-collapsible-header \
    expo react-native-reanimated react-native-safe-area-context
```

The native libraries and `@rnw-community/react-native-collapsible-header` are peer dependencies and must be installed
by the host application: the application must resolve exactly one copy of the collapsible header, otherwise its scroll
context has two identities and the chrome components fail to find their provider. Supported versions are
`react-native-reanimated >=4.1.0 <5` on `react-native >=0.78`; Reanimated 4 applications also install
`react-native-worklets` and configure `react-native-worklets/plugin`.

The package is an Expo module: its native `ScreenChromeProgressiveBlurView` draws the edge-fade blur on iOS and
Android, so the application needs `expo` (`>=55 <59`), the New Architecture, and a native rebuild (`npx expo prebuild`
or `pod install`) after installing it. Expo Go does not include the view. On iOS the view applies Core Animation's
`variableBlur` filter, which UIKit does not expose publicly; it is reached by runtime lookup and degrades to a uniform
blur if a future iOS removes it. On Android it eases a QmBlurView blur out through a gradient mask. The wash is a
`experimental_backgroundImage` gradient. Web uses CSS `backdrop-filter` layers and never loads the native view.

## Migrating to 3.0

3.0 replaces the optional blur stack with this package's required Expo native view. Remove `blurMethod` and
`blurTarget` from `EdgeFade` and `CollapsibleHeaderBackdrop`. Custom `renderBand` / `renderEdgeFadeBand` callbacks
no longer receive `tint`; render the supplied `blur` or `defaultBand` element instead.

Before (2.x):

```tsx
<BlurTargetView ref={blurTarget}>{content}</BlurTargetView>
<EdgeFade position="bottom" blurMethod="dimezisBlurView" blurTarget={blurTarget} />
```

After (3.0):

```tsx
<View>{content}</View>
<EdgeFade position="bottom" chromeHeight={48} />
```

`chromeHeight` is the height of your chrome beyond the safe-area inset: the blur holds its full radius there, then
fades across the remaining band. The default is `0`. Bands now start at the screen edge; the native default header
backdrop height is 128 points instead of 220. `intensityInputRange` now fades a fixed-radius native blur through opacity,
with the radius set by `maxIntensity`, rather than animating the radius.

Remove `expo-blur`, `@react-native-masked-view/masked-view`, `expo-linear-gradient`, and
`@sbaiahmed1/react-native-blur` if nothing else in your app uses them. None is a peer or fallback in 3.0. Install the
new required `expo` peer (`>=55 <59`); bare React Native apps must configure Expo modules too. Build a new native
binary after upgrading (`npx expo run:ios` / `npx expo run:android`, or your native build pipeline). An OTA update alone
cannot install the view. Expo Go is unsupported; use a development or production build. A missing native module is
an error. Web continues to use CSS `backdrop-filter`.

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

const SCREEN_CHROME_CONFIG = { snapToCollapse: true };

export const AccountsScreen = () => (
    <ScreenChromeProvider config={SCREEN_CHROME_CONFIG}>
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
`ScreenChromeScrollView` connects that wiring automatically; any other animated scrollable spreads
[`useScreenChromeScrollProps`](#usescreenchromescrollprops) (see [Recipes](#recipes)), and a scrollable that keeps its
own offset drives the chrome through the provider's [`scrollY`](#external-scroll-offset) prop instead.
`useScreenChrome` returns `{ colorScheme, config, renderEdgeFadeBand?, externalScrollY? }`.

Mount one `ScreenChromeProvider` per scrollable, inside each screen, and never once around a navigator: a provider owns
exactly one scroll offset and one snap slot, so a shared provider makes the last-scrolled screen drive every header.
Several chrome components within one screen share one provider by design.

Render content first, decorative `EdgeFade` and `CollapsibleHeaderBackdrop` layers second, and interactive
`CollapsibleHeader` chrome last. Native blur then samples the content beneath it while controls remain above decorative
layers. `ScreenChromeScrollView` adds safe-area padding and caller-provided content insets; explicit consumer padding in
`contentContainerStyle` remains last and wins.

## Styling and NativeWind

The package bundles no theme and parses no class names. Every rendered node takes plain style objects or arrays
(including unistyles-sanitized objects), merged after the package defaults so the consumer value wins:

| Node                                    | Style prop                                                                             | Other props                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `ScreenChromeFrame`                     | `style`                                                                                | every `ViewProps` prop                              |
| `ScreenChromeScrollView`                | `style`, `contentContainerStyle` (see `contentInsetMode`)                              | every `ScrollView` prop except the scroll wiring    |
| `CollapsibleHeader` container           | `style`                                                                                | every `ViewProps` prop except `pointerEvents`       |
| `CollapsibleHeader` title layers        | `expandedContentContainerStyle`, `collapsedContentContainerStyle`                      | —                                                   |
| `CollapsibleHeader` control row         | `persistentContentContainerStyle` (layer), `persistentRowStyle` (row inside the layer) | —                                                   |
| `CollapsibleHeaderSlot`                 | `style`                                                                                | every `ViewProps` prop except `pointerEvents`       |
| `ScreenChromeHeader`                    | `style` (container), `rowStyle` (row)                                                  | every `ViewProps` prop except `pointerEvents`       |
| `EdgeFade`, `CollapsibleHeaderBackdrop` | `style`                                                                                | every `ViewProps` prop except the inert props below |
| `ScreenChromeFooter`                    | `style` (container), `contentStyle` (measured content)                                 | every `ViewProps` prop except `pointerEvents`       |

`CollapsibleHeaderTitleSlot` is a grouping marker whose own node is never mounted — its two children become the title
layers — so title layers are styled through `expandedContentContainerStyle` and `collapsedContentContainerStyle`.
Package-owned props are applied after the spread on purpose: `pointerEvents="box-none"` on the header, slots and
footer keeps empty chrome from swallowing touches, and `pointerEvents="none"` plus the hidden-accessibility props on
edge fades keep decorative bands out of hit testing and screen readers.

NativeWind resolves `className` at the JSX call site, and this package ships precompiled output, so a `className`
string forwarded into the package would reach a native view unresolved. Wrap the components you style with classes
once at module scope instead — NativeWind v5 `styled`, or `cssInterop` with the same mapping on v4. NativeWind v5 has
no global registration, so the package ships no side-effect `className` entry point; the wrapper is the supported path:

```tsx
import { styled } from 'nativewind';

const ChromeScrollView = styled(ScreenChromeScrollView, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle',
});
const ChromeHeaderSlot = styled(CollapsibleHeaderSlot, { className: 'style' });
```

## CollapsibleHeader

Composes the optional persistent leading/trailing controls and the expanded/collapsed title layers of its compound
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

Both control slots are optional — a title-only header, or one with just a back button or just a trailing action, is
the same component with fewer children:

```tsx
<CollapsibleHeader>
    <CollapsibleHeaderTitleSlot>
        {/* expanded title */}
        {/* collapsed title */}
    </CollapsibleHeaderTitleSlot>
    <CollapsibleHeaderSlot>{/* trailing control */}</CollapsibleHeaderSlot>
</CollapsibleHeader>
```

A missing control is replaced by an empty, non-interactive placeholder in the persistent row, so the row keeps its
`space-between` layout and a lone trailing control stays right-aligned instead of sliding to the leading edge.

The header container rests at `safeAreaInsets.top + config.headerHeight` and collapses to
`safeAreaInsets.top + config.collapsedHeaderHeight` (which defaults to `headerHeight`, i.e. no height change) over the
`collapseStart`–`collapseEnd` window. Both title layers and the persistent control row start at `safeAreaInsets.top`
and fill the remaining header height, so `config.headerHeight` is always the usable expanded content height regardless
of notch or dynamic-island depth, and the controls and collapsed title stay vertically centered in the shrinking band.
The primitive positions those layers absolutely inside the animated header, so the offset is a layer `top` rather than container padding — padding leaves absolute layers resolving against the full
container box and centers their content over the inset instead of below it. It is the same composition
`ScreenChromeScrollView` applies to `contentInsetTop`, so passing `contentInsetTop={config.headerHeight}` clears the
overlay header exactly at rest. Content insets and header metrics always use the expanded `headerHeight`: content must
clear the header before any scroll, and the overlay header only shrinks once that content has scrolled under it.

```tsx
<ScreenChromeProvider config={{ headerHeight: 156, collapsedHeaderHeight: 40 }}>{children}</ScreenChromeProvider>
```

Pass `motion` to override individual per-layer animation windows or transforms derived from config — any key you set
wins, the rest stay config-driven. This covers app-specific motion (for example an earlier background fade start, or
expanded-layer scale) without widening the config surface:

```tsx
<CollapsibleHeader motion={{ backgroundOpacityStartProgress: 0.7, expandedScale: 0.9 }}>{/* slots */}</CollapsibleHeader>
```

Both title layers default to centered content behind a 72pt gutter that keeps the title clear of the leading and
trailing controls. For an iOS-style leading large title, set `expandedTitleAlignment="start"`
([`ExpandedTitleAlignment`](#expandedtitlealignment)): the expanded title stretches from the leading edge and is padded
by the row padding plus the default 44pt slot size on the side of each non-empty slot, so it clears standard icon
controls and uses the space of an empty slot. The collapsed title stays centered. The reserve is static, not measured:
a control wider than 44pt (a text button, or a slot resized through `style`) needs a matching `paddingStart`/`paddingEnd`
in `expandedContentContainerStyle`.

```tsx
<CollapsibleHeader expandedTitleAlignment="start">{/* slots */}</CollapsibleHeader>;

const { rowPadding } = SCREEN_CHROME_HEADER_LAYOUT_METRICS;

<CollapsibleHeader expandedTitleAlignment="start" expandedContentContainerStyle={{ paddingStart: rowPadding + 72 }}>
    {/* a 72pt-wide "Cancel" leading slot */}
</CollapsibleHeader>;
```

`expandedContentContainerStyle`, `collapsedContentContainerStyle` and `persistentContentContainerStyle` are forwarded to
the primitive and merged after those defaults, so a consumer style always wins. `persistentRowStyle` merges after the
control row's own defaults (`space-between`, row padding), for example to change the row's horizontal padding.
Derive custom offsets from [`SCREEN_CHROME_HEADER_LAYOUT_METRICS`](#screen_chrome_header_layout_metrics) instead of copying the numbers.

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/collapsible-header.gif" alt="Collapsible header: the large title collapses into the small title row between persistent controls while the list scrolls" width="280" />

## Compound header contract

`CollapsibleHeader` requires exactly one `CollapsibleHeaderTitleSlot` direct child and accepts at most one
`CollapsibleHeaderSlot` before it (the leading control) and at most one after it (the trailing control). The title slot
must directly contain the expanded title followed by the collapsed title. `null`, `false`, and `undefined` children are
ignored, so `{canGoBack && <CollapsibleHeaderSlot>…</CollapsibleHeaderSlot>}` works; fragments, host views, and
unmarked wrapper components are rejected so slot discovery stays deterministic.

Slots are recognized by a stable string marker, `screenChromeSlotKind` (a [`CollapsibleHeaderSlotKind`](#collapsibleheaderslotkind)),
that each slot component carries as a static property — `'control'` for `CollapsibleHeaderSlot`, `'title'` for
`CollapsibleHeaderTitleSlot` — never by component identity. Two resolved copies of this package in
one bundle (for example `dist/module` for one importer and `dist/commonjs` for another) produce two distinct function
identities for the same slot; the marker still matches both, so such a bundle renders instead of throwing.

The shape above is a compound-component contract that TypeScript's type system cannot express: JSX children are
`ReactNode`, so nothing in the type checker distinguishes a valid slot set from an arbitrary fragment tree at compile
time. `CollapsibleHeader` therefore validates its children at render time and throws a `TypeError` naming the violated
rule (unknown child type, missing title slot, duplicate slot, wrong title-layer count) instead of silently mounting a
broken layout.

Slot discovery deliberately inspects children synchronously instead of having each slot register itself through
context: registration would mount the slots, collect them in an effect, and only then render the header layers, so the
first frame would paint an empty header.

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

The slot is `pointerEvents="box-none"`, so an empty or narrow slot never swallows taps while its children stay
pressable. It defaults to a 44pt minimum; `style` merges last to adjust size or spacing, so overriding
`minWidth`/`minHeight` makes the rendered control responsible for its own touch target. Every other `ViewProps` prop
(`testID`, `collapsable`, accessibility props, `onLayout`, …) is forwarded to the slot node.

## CollapsibleHeaderTitleSlot

Groups the direct expanded and collapsed title layers of a compound collapsible header; title opacity and pointer-event
handoff between them are delegated to `@rnw-community/react-native-collapsible-header`.

```tsx
<CollapsibleHeaderTitleSlot>
    <Text>Accounts</Text>
    <Text>Accounts</Text>
</CollapsibleHeaderTitleSlot>
```

Inside `CollapsibleHeader` the slot itself is not mounted — its two children become the title layers — so style those
layers through `expandedContentContainerStyle` and `collapsedContentContainerStyle`.

## CollapsibleHeaderSlotKind

The `screenChromeSlotKind` marker value a compound header child carries: `'control' | 'title'`. A wrapper component
around a slot is only accepted when it carries the same static marker as the slot it renders:

```tsx
const BackSlot = ({ onPress }: { readonly onPress: () => void }) => (
    <CollapsibleHeaderSlot>
        <Pressable accessibilityRole="button" onPress={onPress}>
            <Text>Back</Text>
        </Pressable>
    </CollapsibleHeaderSlot>
);
BackSlot.screenChromeSlotKind = 'control' satisfies CollapsibleHeaderSlotKind;
```

## CollapsibleHeaderBackdrop

Renders a top `EdgeFade` sized to `headerBackdropHeight` and aligned with the configured title-collapse thresholds, so
native blur samples the content scrolling beneath the header.

```tsx
<CollapsibleHeaderBackdrop />
```

Every `EdgeFade` prop except `position` is forwarded, so `testID`, `style`, and `renderBand` reach the
band; `height`, `chromeHeight` (default `headerHeight`) and `scrollAnimation` replace the header-derived defaults only when supplied:

```tsx
<CollapsibleHeaderBackdrop testID="header-backdrop" renderBand={renderSolidBand} />
```

## CollapsibleHeaderBackdropPropsInterface

`Omit<EdgeFadePropsInterface, 'position'>`: `height` defaults to `headerBackdropHeight`, and `scrollAnimation` defaults
to opacity over `collapseStart`–`smallTitleStart` and blur intensity over `collapseStart`–`collapseEnd`.

```tsx
const backdropProps: CollapsibleHeaderBackdropPropsInterface = { testID: 'header-backdrop', height: 120 };
```

## Edge fades

Every band starts at the screen edge and covers the safe-area inset plus its configured height. A native band holds
its full blur radius behind the chrome it sits under (the inset plus `chromeHeight`), easing the radius to zero on
iOS and the blur opacity to zero on Android; web cross-fades four fixed-radius layers. The blur sits under a color wash that eases from
solid at the edge to transparent inward. Bands ignore pointer events and accessibility traversal, and scroll animation
changes opacity while the radii stay static. Native defaults use 150-point top and bottom bands, while web defaults use
76-pixel bands.

## EdgeFade

Renders a decorative top or bottom blur band, scroll-animatable through `scrollAnimation`.

```tsx
<EdgeFade position="bottom" height={96} scrollAnimation={{ opacityInputRange: [0, 80] }} />
```

Native bands hold the full blur radius over the safe-area inset plus `chromeHeight` (the bar the band sits behind) and
fade it across the rest of the band (variable radius on iOS, a masked uniform blur on Android), so the chrome stays legible while content fades into the blur without a
visible start line. Web bands hold the full radius over the larger of that zone and the inset plus the edge half of
the band height before easing out. The edge radius is `max(8, intensity × 0.45)` points, using `scrollAnimation.maxIntensity` while an
`intensityInputRange` is set, which fades the native view in through opacity, so scrolling never rebuilds the blur.

On web the band is four `backdrop-filter` layers with radii of 1, 1/2, 1/4 and 1/8 of the edge radius. Each weaker
layer fades in while the previous one is still opaque and stays opaque while that one fades out, so the radius steps
down through cross-fades with no visible boundary, under a separately masked wash. Every layer box extends two radii
past the part its mask shows, because a `backdrop-filter` box edge itself draws a visible seam. Only `scrollAnimation.opacityInputRange` animates, and it fades each layer rather than the container — an
ancestor with `opacity` below 1 or a mask becomes the backdrop root, and a `backdrop-filter` beneath it has nothing left
to blur. The static radii are deliberate: changing a
`backdrop-filter` radius re-rasterizes the blurred backdrop on every scroll frame, while the opacity fade over fixed
blurs stays on the compositor.

### Custom band content

`renderBand` replaces the band content while the package keeps the band metrics, absolute positioning, safe-area
offset, scroll-driven opacity, and the inert pointer/accessibility props on the container. The renderer receives the
resolved visuals (`EdgeFadeBandRenderPropsInterface`), including the animated `blur` element and the complete
`defaultBand`, so a renderer can wrap, compose, or conditionally fall back to the package output. Pass it per
instance, or once on `ScreenChromeProvider` as `renderEdgeFadeBand`; the per-instance prop wins. Without either, the
output is unchanged. Web honours the same contract: the blur slices and the wash move off the container
into `blur` (blur slices only) and `defaultBand` (blur slices and wash) when a renderer is set, and the container keeps
the scroll-driven opacity. In Chromium a container opacity below 1 is a backdrop root, so the web `blur` renders
unblurred while a renderer band is mid-fade.

```tsx
const renderSolidBand: EdgeFadeBandRenderer = ({ colorScheme }) => (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000000' : '#ffffff' }} />
);

<EdgeFade position="bottom" renderBand={renderSolidBand} />;
```

## EdgeFadePropsInterface

| Prop              | Type                               | Description                                                                          |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| `position`        | `EdgeFadePosition`                 | Screen edge the band renders at.                                                     |
| `height`          | `number`                           | Band height; defaults to the provider config's fade height.                          |
| `chromeHeight`    | `number`                           | Chrome the blur holds full strength behind, beyond the inset; defaults to `0`.       |
| `intensity`       | `number`                           | Static blur intensity; ignored while `scrollAnimation` drives it.                    |
| `scrollAnimation` | `EdgeFadeScrollAnimationInterface` | Optional scroll-driven opacity and blur intensity ranges.                            |
| `renderBand`      | `EdgeFadeBandRenderer`             | Custom band content; defaults to the provider's `renderEdgeFadeBand`, then built-in. |

## EdgeFadeScrollAnimationInterface

Configures scroll-driven edge-fade opacity and blur intensity.

```ts
const scrollAnimation: EdgeFadeScrollAnimationInterface = {
    opacityInputRange: [0, 80],
    intensityInputRange: [0, 80],
    maxIntensity: 60,
};
```

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/bottom-fade.gif" alt="Scroll-driven bottom edge fade ramping in as the list scrolls and out again at the top" width="280" />

## EdgeFadePosition

Identifies the screen edge where a fade band is rendered: `'top' | 'bottom'`.

## EdgeFadeBandRenderer

`(props: EdgeFadeBandRenderPropsInterface) => ReactNode` — renders custom band content inside the package's positioned,
scroll-animated, inert band container. Returning `null` renders an empty band.

```tsx
const renderGlassBand: EdgeFadeBandRenderer = ({ defaultBand }) =>
    isLiquidGlassAvailable() ? <GlassView style={{ flex: 1 }} /> : defaultBand;
```

## EdgeFadeBandRenderPropsInterface

| Prop            | Type                             | Description                                                            |
| --------------- | -------------------------------- | ---------------------------------------------------------------------- |
| `position`      | `EdgeFadePosition`               | Screen edge the band renders at.                                       |
| `colorScheme`   | `ScreenChromeColorScheme`        | Active provider color scheme.                                          |
| `height`        | `number`                         | Resolved band height, safe-area inset included.                        |
| `washColors`    | `readonly [string, string]`      | Wash gradient colors from top to bottom, solid at the screen edge.     |
| `maskColors`    | `readonly [string, string, ...]` | Mask colors from the config's `maskStops` for this position, sorted.   |
| `maskLocations` | `readonly [number, number, ...]` | Mask locations matching `maskColors`.                                  |
| `blur`          | `ReactNode`                      | The package's blur element with its static or scroll-driven intensity. |
| `defaultBand`   | `ReactNode`                      | The package's complete default band (blur under the eased wash).       |

## getEdgeFadeBandMetrics

Resolves the geometry an edge-fade band uses — `height` (fade height plus the edge inset) and a `0` `top` or `bottom`
offset, so the band starts at the screen edge and covers the safe-area inset — for custom bands positioned outside
`EdgeFade` in a full-screen parent such as `ScreenChromeFrame`.

```tsx
const insets = useSafeAreaInsets();
const { config } = useScreenChrome();
const metrics = getEdgeFadeBandMetrics('bottom', undefined, config, insets);

<View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0 }, metrics]} />;
```

## EdgeFadeBandMetricsInterface

The `{ height, top?, bottom? }` geometry returned by `getEdgeFadeBandMetrics`; only the offset matching the position is set.

## ScreenChromeFrame

Provides the relative full-screen layout root for content, fades, and header chrome.

```tsx
<ScreenChromeFrame>{children}</ScreenChromeFrame>
```

### Sheets, modals, and nested navigators

The chrome never reads the native header, the window size, or the status bar: every inset comes from
`useSafeAreaInsets()` of the nearest `SafeAreaProvider`, and every layer is positioned inside `ScreenChromeFrame`. A
screen therefore needs no special handling inside Expo Router `screenLayout` wrappers, nested stacks, or
`headerShown: false` navigators — only the provider that feeds it the insets must describe the screen's own frame.

An iOS `formSheet` or `pageSheet` (and a native modal in general) starts below the status bar, while a provider at the
app root still reports the full-screen top inset. Mount a `SafeAreaProvider` at the root of the sheet screen, as
react-native-safe-area-context recommends for modals, so it measures the sheet itself; the header then gets a `0` top
inset instead of a phantom notch gap:

```tsx
export const EditSheet = () => (
    <SafeAreaProvider>
        <ScreenChromeProvider>
            <ScreenChromeFrame>{/* content, fades, header */}</ScreenChromeFrame>
        </ScreenChromeProvider>
    </SafeAreaProvider>
);
```

Detents only change the frame height: the bottom fade and `ScreenChromeFooter` stay anchored to the frame's bottom
edge, and the native sheet clips the chrome to its corner radius. Space for a grabber is app-owned — pass
`ScreenChromeHeader` `topInset`, or a larger `config.headerHeight` for `CollapsibleHeader`.

## ScreenChromeHeader

Renders a static, non-collapsible header row with the same safe-area and paint-order contract as the collapsible one:
absolute at the top, `zIndex: 3`, `box-none`, sized to `insets.top + topInset + headerHeight` so
`getScreenChromeHeaderMetrics` predicts its footprint exactly. `topInset` adds app-owned padding beyond the safe area
for screens that nest under an already-padded container. Requires a `ScreenChromeProvider` ancestor. `style` and every
other `ViewProps` prop except `pointerEvents` go to the container; `rowStyle` merges after the row defaults
(`space-between`, row padding), so `rowStyle={{ paddingHorizontal }}` replaces the default 16pt row padding; it never
overrides the configured `headerHeight`, so the metrics stay exact.

```tsx
<ScreenChromeHeader testID="header" topInset={10} style={styles.headerBackground} rowStyle={{ paddingHorizontal: 8 }}>
    <Button onPress={goBack} title="Back" />
    <Text>{title}</Text>
</ScreenChromeHeader>
```

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/static-header.gif" alt="Static header and top edge fade staying fixed while the list scrolls underneath" width="280" />

`inFlow` lays the header out in the normal flow instead of floating it over the content: the container is
`position: 'relative'` and the row takes `headerHeight` as a `minHeight`, so a multi-line title or a bottom row grows
the header and pushes the content down instead of being clipped. The header still pads the safe area, so give the
scrollable below it `includeTopSafeArea={false}` and no header content inset:

```tsx
<ScreenChromeFrame>
    <ScreenChromeHeader inFlow>
        <Text>{title}</Text>
    </ScreenChromeHeader>
    <ScreenChromeScrollView includeTopSafeArea={false}>{rows}</ScreenChromeScrollView>
</ScreenChromeFrame>
```

## ScreenChromeProvider

Provides validated configuration and color scheme to screen chrome components around one scrollable.

```tsx
<ScreenChromeProvider colorScheme="dark" config={{ snapToCollapse: true }}>
    {children}
</ScreenChromeProvider>
```

`colorScheme` defaults to `'light'`; pass `'system'` to follow the device appearance — see
[`ScreenChromeColorSchemePreference`](#screenchromecolorschemepreference).

The provider and its chrome survive `react-freeze` (`enableFreeze()`) and `<Activity mode="hidden">`: the scroll
offset, the collapsed header state, edge-fade scroll subscriptions, and snap registration all persist across a hide
and show cycle. `<Activity>` itself requires React 19.2 or newer; the package's `react >=18` peer floor only covers
`react-freeze`.

`syncNativeScrollOffset` is forwarded to the underlying `CollapsibleHeaderProvider`: it mirrors the native scroll
offset into the shared scroll value so navigator offset restores without a scroll event keep the header in sync. It is
opt-in because it requires the chrome scroll ref to resolve to a real host scrollable — see the collapsible-header
readme for the full constraint.

`renderEdgeFadeBand` sets the app-wide band renderer every `EdgeFade` and `CollapsibleHeaderBackdrop` inside the
provider uses unless it passes its own `renderBand` — see [EdgeFade custom band content](#custom-band-content):

```tsx
<ScreenChromeProvider renderEdgeFadeBand={renderSolidBand}>{children}</ScreenChromeProvider>
```

Pass a stable `config` reference — a module-scope constant, or one owned by state — rather than the inline literal above.
React Compiler memoizes the merge, validation, and context value on the identity of that prop, so a fresh literal on
every parent render re-merges, re-validates, and re-broadcasts the context to every chrome consumer:

```tsx
const SCREEN_CHROME_CONFIG = { snapToCollapse: true };

export const AccountsScreen = () => <ScreenChromeProvider config={SCREEN_CHROME_CONFIG}>{children}</ScreenChromeProvider>;
```

### External scroll offset

`scrollY` hands the chrome an app-owned Reanimated `SharedValue<number>` instead of the provider-owned offset. Every
scroll-driven piece — `CollapsibleHeader`, `EdgeFade` scroll animations, `useScrollInterpolation`, and
`useScrollFadeStyle` — then reads it, so any scrollable that can write its offset into a shared value drives the chrome
without attaching the provider's `onScroll` or ref:

```tsx
export const FeedScreen = () => {
    const scrollY = useSharedValue(0);
    const onScroll = useAnimatedScrollHandler(event => {
        scrollY.set(event.contentOffset.y);
    });

    return (
        <ScreenChromeProvider scrollY={scrollY}>
            <ScreenChromeFrame>
                <AnimatedLegendList data={posts} renderItem={renderPost} onScroll={onScroll} scrollEventThrottle={16} />
                <CollapsibleHeader>
                    <CollapsibleHeaderTitleSlot>
                        <Text>Feed</Text>
                        <Text>Feed</Text>
                    </CollapsibleHeaderTitleSlot>
                </CollapsibleHeader>
            </ScreenChromeFrame>
        </ScreenChromeProvider>
    );
};
```

Write the offset from a worklet (`useAnimatedScrollHandler`, or a library's own shared value) rather than a JS-thread
`onScroll`, and use `.get()`/`.set()` rather than `.value` so the recipe stays React Compiler safe. Snapping scrolls
the provider-owned scrollable through its ref, which an external source never attaches, so passing `scrollY` together
with `snapToCollapse: true` throws during provider render — the same single-scroll-source rule the collapsible-header
primitive enforces for its own `scrollY` prop. Pass a stable shared value: the provider exposes it through context, so a
new one per render re-broadcasts the context to every chrome consumer.

## ScreenChromeScrollView

Connects an animated scroll view to the collapsible-header scroll wiring and safe-area content padding.

```tsx
<ScreenChromeScrollView contentInsetTop={96} contentInsetBottom={48}>
    <Text>Consumer-owned content</Text>
</ScreenChromeScrollView>
```

Scroll is package-owned: `onScroll` and `scrollEventThrottle` come from the provider
(`useCollapsibleHeaderScroll` and `config.scrollEventThrottle`) and are omitted from the props, so passing them is a
type error instead of a silently discarded value. A consumer `ref` is accepted and fans out through `mergeRefs`
alongside the chrome scroll ref, so imperative APIs like `scrollTo` and keyboard-aware wrappers keep working without
detaching the header wiring.

`contentInsetMode` selects how the computed safe-area+chrome padding meets a consumer `contentContainerStyle`:
`'replace'` (the default, unchanged) lets consumer padding win, while `'additive'` stacks the computed insets on top
of consumer `paddingTop`/`paddingBottom` via [`addScrollContentInset`](#addscrollcontentinset) and never injects
horizontal padding:

```tsx
<ScreenChromeScrollView contentInsetMode="additive" contentInsetTop={96} contentContainerStyle={{ paddingTop: 8 }} />
```

`includeTopSafeArea={false}` drops the top safe-area inset from the content padding and indicator insets for a
scrollable laid out below an in-flow header that already pads the notch:

```tsx
<ScreenChromeScrollView includeTopSafeArea={false} />
```

The scroll view also sets `scrollIndicatorInsets` to the same safe-area+chrome top and bottom insets (with
`automaticallyAdjustsScrollIndicatorInsets={false}`), so the iOS scroll indicator never runs under the header or the
bottom inset; pass either prop to override it.

Change the event rate through
`<ScreenChromeProvider config={{ scrollEventThrottle: 8 }}>`. The provider's `onScroll` is one processed Reanimated
handler that also carries drag and snap events, so it is attached whole rather than wrapped — read the scroll position
from the shared offset through [`useScreenChromeScrollY`](#usescreenchromescrolly) instead:

```tsx
const scrollY = useScreenChromeScrollY();

useAnimatedReaction(
    () => scrollY.get(),
    offsetY => {
        runOnJS(onOffsetChange)(offsetY);
    }
);
```

Every other `ScrollView` prop passes through untouched, including the scroll callbacks the package does not own
(`onMomentumScrollEnd`, `onContentSizeChange`, …) and `contentContainerStyle` — consumer padding is applied after the
safe-area padding and wins.

`ScreenChromeScrollView` is a thin consumer of [`useScreenChromeScrollProps`](#usescreenchromescrollprops); use the
hook directly to wire any other scrollable.

## useScreenChromeScrollProps

Composes the scroll handler, merged ref, throttle, content padding and indicator insets any scrollable needs for chrome
— the same bag `ScreenChromeScrollView` spreads, so a list gets identical wiring and insets. Accepts the
[`ScreenChromeScrollPropsOptionsInterface`](#screenchromescrollpropsoptionsinterface) options and returns
[`ScreenChromeScrollPropsInterface`](#screenchromescrollpropsinterface); spread it last so the package-owned
`onScroll`/`scrollEventThrottle` are not overridden.

```tsx
const TransactionList = () => {
    const scrollProps = useScreenChromeScrollProps({ contentInsetTop: 96 });

    return <Animated.FlatList data={transactions} keyExtractor={keyExtractor} renderItem={renderItem} {...scrollProps} />;
};
```

FlashList takes the same bag once wrapped at module scope; pass a consumer `ref` through the options so it merges with
the chrome ref instead of replacing it:

```tsx
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Transaction>);

const TransactionList = () => {
    const listRef = useRef<FlashListRef<Transaction>>(null);
    const scrollProps = useScreenChromeScrollProps({ contentInsetTop: 96, ref: listRef });

    return <AnimatedFlashList data={transactions} keyExtractor={keyExtractor} renderItem={renderItem} {...scrollProps} />;
};
```

The returned `ref` attaches to component instances and imperative handles alike; for LegendList pass it as
`refScrollView` (`const { ref, ...scrollProps } = useScreenChromeScrollProps()`). The worklet `onScroll` only stays
cheap when rows do not re-render per scroll frame, so keep `renderItem` rendering memoized item components without
inline object or arrow literals, and give the list a stable module-scope `keyExtractor`.

## ScreenChromeScrollPropsOptionsInterface

Configures `useScreenChromeScrollProps`: `contentInsetTop`/`contentInsetBottom` (default `0`), `contentInsetMode`
(default `'replace'`, see [`ScrollContentInsetMode`](#scrollcontentinsetmode)), a consumer `contentContainerStyle`,
`includeTopSafeArea` (default `true`; `false` under an in-flow header), and a consumer `ref` merged with the chrome
scroll ref.

## ScreenChromeScrollPropsInterface

The `{ ref, onScroll, scrollEventThrottle, contentContainerStyle, scrollIndicatorInsets,
automaticallyAdjustsScrollIndicatorInsets }` bag returned by `useScreenChromeScrollProps`. `ref` is a memoized merged
callback ref, stable until the consumer ref changes.

## Recipes

Every recipe spreads [`useScreenChromeScrollProps`](#usescreenchromescrollprops) last, so the list gets the worklet
`onScroll`, the chrome ref, the provider throttle, and the same content and indicator insets as
`ScreenChromeScrollView`. They mirror the
[collapsible-header recipes](https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-collapsible-header/readme.md#recipes);
FlashList and LegendList are not dependencies of this package — the ref contract is structural.

The worklet handler only stays cheap when rows do not re-render per scroll frame: render memoized item components,
keep inline object and arrow literals out of `renderItem`, use a stable module-scope `keyExtractor`, and give
heterogeneous lists item types (`getItemType` on FlashList and LegendList). React Compiler covers the memoization half
only in applications that enable it.

### FlatList

`Animated.FlatList` ships with Reanimated:

```tsx
const keyExtractor = (item: Transaction): string => item.id;
const renderItem = ({ item }: ListRenderItemInfo<Transaction>) => <TransactionRow transaction={item} />;

const TransactionList = () => {
    const scrollProps = useScreenChromeScrollProps({ contentInsetTop: 96 });

    return <Animated.FlatList data={transactions} keyExtractor={keyExtractor} renderItem={renderItem} {...scrollProps} />;
};
```

### SectionList

Reanimated has no animated `SectionList`; wrap it once at module scope so the component identity is stable. This is
the path off a JS-thread `onScroll` for a sectioned feed:

```tsx
const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<Transaction>);

const TransactionSections = () => {
    const scrollProps = useScreenChromeScrollProps({ contentInsetTop: 96 });

    return <AnimatedSectionList sections={sections} keyExtractor={keyExtractor} renderItem={renderItem} {...scrollProps} />;
};
```

### FlashList

Wrap `FlashList` the same way and pass a consumer ref through the options so it merges with the chrome ref; the
imperative handle is a supported ref target:

```tsx
const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Transaction>);

const TransactionList = () => {
    const listRef = useRef<FlashListRef<Transaction>>(null);
    const scrollProps = useScreenChromeScrollProps({ contentInsetTop: 96, ref: listRef });

    return (
        <AnimatedFlashList
            data={transactions}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemType={getItemType}
            {...scrollProps}
        />
    );
};
```

### LegendList

`@legendapp/list` publishes its own Reanimated build. Hand the chrome ref to `refScrollView` — the inner animated
`ScrollView` that `scrollTo` drives — and keep the list's own `ref` free for imperative calls:

```tsx
import { AnimatedLegendList } from '@legendapp/list/reanimated';

const TransactionList = () => {
    const { ref, ...scrollProps } = useScreenChromeScrollProps({ contentInsetTop: 96 });

    return (
        <AnimatedLegendList
            refScrollView={ref}
            data={transactions}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            {...scrollProps}
        />
    );
};
```

### Scrollables that own their offset

When a scrollable cannot take the provider's `onScroll` — a wrapper that installs its own handler, or a library that
already exposes its offset as a shared value — pass that offset to the provider's [`scrollY`](#external-scroll-offset)
instead. To keep the content and indicator insets, spread `useScreenChromeScrollProps` **before** the scrollable's own
`onScroll`: props later in the JSX win, so the scrollable's handler must come after the bag or the provider handler
replaces it and the external offset is never written. Snapping stays off with an external offset.

```tsx
<AnimatedLegendList data={posts} renderItem={renderPost} {...useScreenChromeScrollProps()} onScroll={onScroll} />
```

## Bottom chrome

Bottom chrome is a footer pinned over the scroll content plus an inset contract that lets the content clear it:
`ScreenChromeFooter` measures itself and publishes the height into the nearest `BottomChromeInsetProvider`, and
`useBottomChromeInset` reads it back where the scrollable is rendered.

```tsx
const AccountsContent = () => {
    const { chromeHeight } = useBottomChromeInset();

    return (
        <>
            <ScreenChromeScrollView contentInsetBottom={chromeHeight}>{rows}</ScreenChromeScrollView>
            <ScreenChromeFooter>
                <TotalRow />
            </ScreenChromeFooter>
        </>
    );
};

export const AccountsScreen = () => (
    <ScreenChromeProvider>
        <BottomChromeInsetProvider>
            <ScreenChromeFrame>
                <AccountsContent />
            </ScreenChromeFrame>
        </BottomChromeInsetProvider>
    </ScreenChromeProvider>
);
```

The package ships no tab bar and no hide-on-scroll bottom bar. Expo Router's
[`NativeTabs`](https://docs.expo.dev/router/advanced/native-tabs/) renders the platform tab bar — the Liquid Glass bar
with native minimize-on-scroll on iOS 26 — and owns its insets, so a JavaScript re-implementation would only lag
behind the platform. Use `ScreenChromeFooter` for screen-level action and summary bars; a custom bottom bar the app
already owns publishes its height through [`useBottomChromeHeightPublisher`](#usebottomchromeheightpublisher).

## BottomChromeInsetProvider

Owns the measured bottom chrome height that `ScreenChromeFooter` publishes and `useBottomChromeInset` reads. It is
independent of `ScreenChromeProvider`, so it can wrap one screen or sit above a navigator when the same bottom chrome
persists across every screen in it. Prefer one provider per screen: a stack keeps a covered screen's footer mounted,
and a navigator-wide provider would keep publishing that footer's height to the screen pushed on top. Each footer
registers its own height, and the provider publishes the tallest one: footers are bottom-anchored and overlap, so the
tallest one is what the content has to clear, and unmounting one footer leaves the others' heights in place.

```tsx
<BottomChromeInsetProvider>{screen}</BottomChromeInsetProvider>
```

## useBottomChromeInset

Returns a [`BottomChromeInsetInterface`](#bottomchromeinsetinterface): `chromeHeight` is the measured footer height
without the safe area, which is exactly what `ScreenChromeScrollView`'s `contentInsetBottom` expects because the scroll
view adds the safe-area bottom itself; `inset` adds the safe-area bottom for surfaces that do not, such as a `FlatList`
`contentContainerStyle` or an absolutely positioned button. Without a provider or a mounted footer `chromeHeight` is
`0`, so the hook never throws. A reserve with a floor composes from it directly:

```tsx
const { chromeHeight } = useBottomChromeInset();

<ScreenChromeScrollView contentInsetBottom={Math.max(132, chromeHeight + 88)} />;
```

The value changes only when the footer's measured height changes — never per scroll frame and never when the footer
is moved by a transform — so pairing it with the scroll view relayouts content only on real footer resizes.

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/tab-bar.gif" alt="Floating tab bar built on ScreenChromeFooter, with the list clearing it through useBottomChromeInset" width="280" />

## useBottomChromeHeightPublisher

Publishes one bottom chrome height into the nearest `BottomChromeInsetProvider` — the publisher `ScreenChromeFooter`
uses internally — for bottom chrome the app renders itself, such as a custom floating tab bar. Spread the returned
[`BottomChromeHeightPublisherInterface`](#bottomchromeheightpublisherinterface) onto the node to measure it on mount and
on every layout:

```tsx
const TabBar = () => (
    <View collapsable={false} style={styles.tabBar} {...useBottomChromeHeightPublisher()}>
        {tabs}
    </View>
);
```

Pass a declared `height` (see [`BottomChromeHeightPublisherOptionsInterface`](#bottomchromeheightpublisheroptionsinterface))
to reserve a fixed height instead: layout events are then ignored, so the reservation survives the bar being hidden by
a transform, `opacity`, or `display: 'none'`. Call the hook from a component that stays mounted, such as the tab
layout, to keep the reservation while the bar itself unmounts, so `useBottomChromeInset` consumers never jump:

```tsx
const TabLayout = () => {
    useBottomChromeHeightPublisher({ height: TAB_BAR_HEIGHT });

    return <Tabs>{isTabBarVisible ? <TabBar /> : null}</Tabs>;
};
```

The height excludes the safe-area bottom, like every published height. Unmounting the publisher withdraws only its own
entry, and the provider keeps publishing the tallest entry.

## BottomChromeHeightPublisherOptionsInterface

| Option   | Type     | Description                                                                                   |
| -------- | -------- | --------------------------------------------------------------------------------------------- |
| `height` | `number` | Declared height without the safe area, reserved while mounted instead of the measured height. |
| `offset` | `number` | Added to the published height for chrome stacked above other bottom chrome. Default `0`.      |

```tsx
const options: BottomChromeHeightPublisherOptionsInterface = { height: 68 };

useBottomChromeHeightPublisher(options);
```

## BottomChromeHeightPublisherInterface

The `{ ref, onLayout }` view props returned by `useBottomChromeHeightPublisher`: `ref` is measured synchronously on mount
and `onLayout` republishes every resize. Keep `collapsable={false}` on the node so Android does not flatten it away.

```tsx
const { ref, onLayout }: BottomChromeHeightPublisherInterface = useBottomChromeHeightPublisher();

<View collapsable={false} onLayout={onLayout} ref={ref} />;
```

## BottomChromeInsetInterface

| Field          | Type     | Description                                                                                 |
| -------------- | -------- | ------------------------------------------------------------------------------------------- |
| `chromeHeight` | `number` | Measured bottom chrome height without the safe area; pass to `contentInsetBottom`.          |
| `inset`        | `number` | `chromeHeight` plus the safe-area bottom inset, for surfaces that do not add the safe area. |

```tsx
const { inset }: BottomChromeInsetInterface = useBottomChromeInset();

<FlatList contentContainerStyle={{ paddingBottom: inset }} data={rows} renderItem={renderRow} />;
```

## ScreenChromeFooter

Pins consumer footer content to the bottom edge over a bottom [`EdgeFade`](#edgefade): an absolute, `box-none`
container at `zIndex: 3` padded by the safe-area bottom, with the fade band painted behind a content node. The content
node is measured synchronously on mount and again on every `onLayout`, and the height is published to the nearest
`BottomChromeInsetProvider` (a no-op without one); unmounting the footer withdraws only its own height. The fade reads the
screen chrome config, so the footer requires a `ScreenChromeProvider` ancestor like every other chrome layer.

```tsx
<ScreenChromeFooter contentStyle={{ alignSelf: 'center', maxWidth: 600, width: '100%' }} edgeFadeProps={{ height: 96 }}>
    <Button onPress={onSave} title="Save" />
</ScreenChromeFooter>
```

A `testID` lands on the container and `${testID}-content` on the measured content node; every other `View` prop is
forwarded to the container.

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/header-and-footer.gif" alt="Static header with a ScreenChromeFooter total bar over a bottom edge fade while the list scrolls" width="280" />

### Stacked footer

To stack the footer above other bottom chrome, such as a tab bar, pass that chrome's footprint as `bottomOffset`, and
pass `includeBottomSafeArea={false}` when the chrome below already pads the safe area. The footer publishes
`bottomOffset` plus its content height, minus the safe area it no longer pads, so `useBottomChromeInset` clears both
layers. Pass the lower chrome's own height (for example the height declared through
[`useBottomChromeHeightPublisher`](#usebottomchromeheightpublisher)), not `useBottomChromeInset()`: that value already
includes this footer's height.

```tsx
const insets = useSafeAreaInsets();

<ScreenChromeFooter bottomOffset={TAB_BAR_HEIGHT + insets.bottom} includeBottomSafeArea={false}>
    <SearchInput />
</ScreenChromeFooter>;
```

### Keyboard-sticky footer

Keyboard tracking belongs to [`react-native-keyboard-controller`](https://kirillzyusko.github.io/react-native-keyboard-controller/),
which the package deliberately does not depend on. Wrap the footer in its `KeyboardStickyView`, anchored where the
footer would sit, and offset the opened state by the safe-area bottom the keyboard already covers:

```tsx
const insets = useSafeAreaInsets();

<KeyboardStickyView offset={{ closed: 0, opened: insets.bottom }} style={styles.footerAnchor}>
    <ScreenChromeFooter style={{ position: 'relative' }}>
        <MessageComposer />
    </ScreenChromeFooter>
</KeyboardStickyView>;
// styles.footerAnchor: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3 }
```

`KeyboardStickyView` moves the footer with a transform, which never fires `onLayout`, so the published inset keeps the
footer's resting height while the keyboard is open; a keyboard-aware scrollable (`KeyboardAwareScrollView`) owns the
keyboard's own clearance. A composer that grows while typing re-measures and republishes on its next layout.

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/keyboard-footer.gif" alt="Message composer footer riding above the keyboard inside KeyboardStickyView" width="280" />

To keep the fade band static while only the input follows the keyboard, put the `KeyboardStickyView` inside the
footer instead. The opened offset is the footer's distance from the bottom edge, which for a stacked footer is
`bottomOffset`:

```tsx
const footprint = TAB_BAR_HEIGHT + insets.bottom;

<ScreenChromeFooter bottomOffset={footprint} includeBottomSafeArea={false}>
    <KeyboardStickyView offset={{ closed: 0, opened: footprint }}>
        <SearchInput />
    </KeyboardStickyView>
</ScreenChromeFooter>;
```

## ScreenChromeFooterPropsInterface

| Prop                    | Type                                       | Description                                                        |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `children`              | `ReactNode`                                | Consumer-owned footer content, rendered above the fade band.       |
| `contentStyle`          | `StyleProp<ViewStyle>`                     | Style of the measured content node: max-width caps and padding.    |
| `edgeFadeProps`         | `Omit<EdgeFadePropsInterface, 'position'>` | Props forwarded to the bottom `EdgeFade` behind the content.       |
| `bottomOffset`          | `number`                                   | Distance from the bottom edge for a stacked footer. Default `0`.   |
| `includeBottomSafeArea` | `boolean`                                  | Pads the safe-area bottom; `false` when stacked. Default `true`.   |
| `...ViewProps`          | `ViewProps`                                | Forwarded to the container, except `children` and `pointerEvents`. |

```tsx
const footerProps: ScreenChromeFooterPropsInterface = {
    children: <TotalRow />,
    contentStyle: { alignSelf: 'center', maxWidth: 600, width: '100%' },
    edgeFadeProps: { height: 96 },
    testID: 'totals-footer',
};

<ScreenChromeFooter {...footerProps} />;
```

## ScreenChromeContext

The React context that carries the resolved screen chrome value to package components and hooks; consumers read it
through `useScreenChrome` rather than `useContext(ScreenChromeContext)` directly.

## useScreenChrome

Reads the nearest `ScreenChromeContext` value and throws when no `ScreenChromeProvider` is mounted.

```tsx
const { colorScheme, config } = useScreenChrome();
```

## useScreenChromeScrollY

Returns the `SharedValue<number>` scroll offset that drives the chrome: the provider's
[external `scrollY`](#external-scroll-offset) when one is passed, otherwise the provider-owned offset. Every
scroll-driven hook in the package reads it, so custom animations stay in sync with the header and fades regardless of
the scroll source. Requires a `ScreenChromeProvider` ancestor.

```tsx
const scrollY = useScreenChromeScrollY();

useAnimatedReaction(
    () => scrollY.get() > 200,
    isPastHero => {
        runOnJS(setShowJumpToTop)(isPastHero);
    }
);
```

## useScrollInterpolation

Derives a clamped value from the chrome scroll offset — the raw driver, never a pre-baked style. Map the scroll range
onto a normalized `[0, 1]` progress once and feed it to as many interpolations as needed, so translate, scale and
opacity share one subscription:

```tsx
const HERO_SCROLL_RANGE = [0, 120] as const;
const PROGRESS_RANGE = [0, 1] as const;

const progress = useScrollInterpolation(HERO_SCROLL_RANGE, PROGRESS_RANGE);
const heroStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.get(),
    transform: [{ translateY: -40 * progress.get() }, { scale: 1 - 0.1 * progress.get() }],
}));
```

Hoist `inputRange` and `outputRange` to module-scope constants as above: the derived-value worklet captures them, so
inline array literals hand it fresh arrays on every render. Requires a `ScreenChromeProvider` ancestor and follows its
[external `scrollY`](#external-scroll-offset) when set.

## useScrollFadeStyle

Opacity sugar over [`useScrollInterpolation`](#usescrollinterpolation): a clamped `{ opacity }` animated style mapped
from the chrome scroll offset. Requires a `ScreenChromeProvider` ancestor.

```tsx
const style = useScrollFadeStyle([0, 80], [1, 0]);
```

## getScreenChromeHeaderMetrics

Computes the rendered header footprint from a header height, the device top inset, and an optional extra header top
inset, matching the height the `CollapsibleHeader` and `ScreenChromeHeader` containers render. Pure and
React-independent, so it works in non-component code and tests. Use the returned number as the scroll content's top
inset so content starts below the header.

```ts
const headerTotalHeight = getScreenChromeHeaderMetrics(config.headerHeight, insets.top, topInset);
```

## useScreenChromeHeaderMetrics

Returns `getScreenChromeHeaderMetrics` for the live provider config and device insets (no extra top inset — the
collapsible container owns none), so screens offset their content from the rendered header without re-merging
`SCREEN_CHROME_DEFAULT_CONFIG`. It always reports the expanded `headerHeight` footprint, never
`collapsedHeaderHeight`: that is the space content must clear at rest. Requires a `ScreenChromeProvider` ancestor.

```tsx
const headerTotalHeight = useScreenChromeHeaderMetrics();
```

## ScreenChromeColorScheme

Selects the light or dark chrome palette for edge fades and backdrop blur tinting: `'light' | 'dark'`. It is the
resolved scheme every chrome consumer reads from `useScreenChrome()` and the band renderer receives — never `'system'`.

```tsx
const { colorScheme } = useScreenChrome();
```

## ScreenChromeColorSchemePreference

The `ScreenChromeProvider` `colorScheme` input: a fixed [`ScreenChromeColorScheme`](#screenchromecolorscheme), or
`'system'` to follow the device appearance. `'system'` is resolved during provider render from React Native's
`useColorScheme()` (`'dark'` selects the dark palette, anything else — `'light'`, `'unspecified'`, `null` — the light
one) and never stored in state, so an appearance change re-renders the provider with the new palette and the context
value stays `'light' | 'dark'`. A fixed value ignores the device appearance entirely.

```tsx
<ScreenChromeProvider colorScheme="system">{children}</ScreenChromeProvider>
```

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/light-dark.gif" alt="Switching the provider colorScheme between the light and dark palettes" width="280" />

## ScreenChromeColorSetInterface

Defines the solid and translucent wash colors used by a chrome color scheme.

```ts
const lightColors: ScreenChromeColorSetInterface = { solid: 'rgba(255,255,255,0.42)', wash: 'rgba(255,255,255,0.08)' };
```

## ScreenChromeConfigInterface

Configures screen chrome geometry, colors, fade masks, scroll throttling, and collapse thresholds. See
[Configuration and snapping](#configuration-and-snapping) for the threshold ordering rule and
[`SCREEN_CHROME_DEFAULT_CONFIG`](#screen_chrome_default_config) for the full default shape.

| Field                   | Description                                                                                                                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `headerHeight`          | Expanded header content height below the safe area; used by `CollapsibleHeader` at rest, `ScreenChromeHeader`, and the header metrics.                                                                         |
| `collapsedHeaderHeight` | Optional collapsed `CollapsibleHeader` content height below the safe area; must be positive and not greater than `headerHeight`. Omitted by default, which keeps the collapsed height equal to `headerHeight`. |

## ScreenChromeConfigOverridesInterface

Overrides selected screen chrome defaults while preserving nested color schemes and mask-stop records; the shape
`ScreenChromeProvider`'s `config` prop accepts.

```tsx
<ScreenChromeProvider config={{ headerHeight: 72, colors: { dark: { solid: 'black' } } }}>{children}</ScreenChromeProvider>
```

## ScreenChromeContextValueInterface

The `{ colorScheme, config, renderEdgeFadeBand?, externalScrollY? }` shape returned by `useScreenChrome`; `externalScrollY`
is the provider's [`scrollY` prop](#external-scroll-offset) when one is passed and absent otherwise. Read the offset
that actually drives the chrome through [`useScreenChromeScrollY`](#usescreenchromescrolly) instead.

## ScreenChromeMaskStopInterface

Defines one color stop in an edge-fade mask.

```ts
const stop: ScreenChromeMaskStopInterface = { color: 'rgba(0,0,0,0.99)' };
```

## Configuration and snapping

Provider overrides deep-merge light/dark colors and top/bottom mask stops. Geometry, blur intensity, throttle, mask
positions, colors, and transition ordering are validated; an optional `collapsedHeaderHeight` must be a positive finite
number not greater than `headerHeight`. The required threshold order is
`collapseStart <= smallTitleStart <= largeTitleEnd <= collapseEnd` with a non-zero collapse interval.

Thresholds are mapped to normalized collapse progress and handed to the generic header as its `motion` config, so
`smallTitleStart` and `largeTitleEnd` keep their meaning while the transition itself is owned upstream. The
pointer-event and accessibility switch is deliberately left unset so the primitive derives it from the mapped
cross-fade midpoint, which keeps the interactive, accessibility-exposed title the one that is actually visible for
every threshold pair.

`snapToCollapse` is forwarded to the generic header's `snap` prop, which snaps the scrollable toward the nearest
endpoint once a released scroll holds still for three frames — momentum events are never relied on, because a
worklet-only scroll handler never receives them on Android. Snapping therefore requires a mounted `CollapsibleHeader`:
the header registers the snap geometry with the provider, so a screen that enables `snapToCollapse` without rendering
`CollapsibleHeader` scrolls freely. With reduced motion enabled the snap jumps to its endpoint instead of animating.
Snapping also requires the provider-owned scroll: combining `snapToCollapse` with an
[external `scrollY`](#external-scroll-offset) throws.

<img src="https://raw.githubusercontent.com/rnw-community/rnw-community/master/packages/react-native-screen-chrome/docs/snap-off.gif" alt="Collapsible header with snapToCollapse off resting mid-collapse where the drag ends" width="280" />

## SCREEN_CHROME_DEFAULT_CONFIG

The platform default `ScreenChromeConfigInterface`: native (`screen-chrome-default-config.constant.ts`) uses 150-point top and
bottom fade bands and a 128-point header backdrop; web (`screen-chrome-default-config.constant.web.ts`) uses 76-pixel bands and a
128-pixel backdrop. The header backdrop is twice the 64-point `headerHeight`, so its blur holds full strength behind the
safe-area inset and the collapsed header and eases out across the next 64 points. `mergeScreenChromeConfig` starts from this value.

## SCREEN_CHROME_HEADER_LAYOUT_METRICS

`SCREEN_CHROME_HEADER_LAYOUT_METRICS` exposes the horizontal metrics the compound header renders with — `rowPadding`
(16), `slotSize` (44) and `titleInset` (72) — so custom title layouts stay aligned when the defaults change.

```tsx
const { rowPadding, slotSize } = SCREEN_CHROME_HEADER_LAYOUT_METRICS;
const titleStart = rowPadding + slotSize;
```

## ScreenChromeHeaderLayoutMetricsInterface

Shape of [`SCREEN_CHROME_HEADER_LAYOUT_METRICS`](#screen_chrome_header_layout_metrics): `rowPadding`, `slotSize` and
`titleInset`, all in points.

## ExpandedTitleAlignment

`'center' | 'start'` — selects how [`CollapsibleHeader`](#collapsibleheader) lays out the expanded title. `'center'` (the
default) centers it behind the symmetric title inset; `'start'` aligns it to the leading edge beside the slots.

## SCREEN_CHROME_SHARED_DEFAULT_CONFIG

The platform-independent subset of the default configuration — geometry, colors, mask stops, and throttling shared by
the native and web `SCREEN_CHROME_DEFAULT_CONFIG` variants.

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

## mergeRefs

Fans one instance out to several refs, so a chrome scroll ref can be attached alongside consumer and local refs.

```tsx
import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import { mergeRefs } from '@rnw-community/react-native-screen-chrome';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);
const { scrollRef } = useCollapsibleHeaderScroll();
const localRef = useRef<KeyboardAwareScrollView>(null);

<AnimatedKeyboardAwareScrollView ref={mergeRefs(scrollRef, localRef, props.ref)} />;
```

Object refs receive the instance on `.current`, function refs are called with it, and `null`/`undefined` entries in the
ref list are skipped. Detach is handled both ways React 19 can request it: the returned cleanup runs each child ref's
own cleanup where one was returned and clears the rest, and calling the merged callback with `null` directly forwards
that `null` to every ref — so no ref is left holding a stale instance and no child cleanup is dropped.

## ScrollContentInsetMode

Selects whether chrome content padding replaces consumer padding or stacks on top of it.

```ts
const mode: ScrollContentInsetMode = 'additive';
```

The two members mirror the two utilities: `'replace'` resolves padding through
[`mergeScrollContentInset`](#mergescrollcontentinset) and `'additive'` through
[`addScrollContentInset`](#addscrollcontentinset). `ScreenChromeScrollView` consumes it as `contentInsetMode`.

## addScrollContentInset

Stacks safe-area and chrome content padding on top of consumer padding, leaving horizontal padding untouched.

```ts
const contentContainerStyle = addScrollContentInset(insets, 96, 48, { paddingTop: 8 });
// paddingTop: insets.top + 96 + 8, paddingBottom: insets.bottom + 48 — no paddingLeft/paddingRight injected
```

The additive counterpart to `mergeScrollContentInset`: consumer `paddingTop`/`paddingBottom` are summed with the
computed insets instead of replacing them, so migrating from an additive layout keeps the computed inset. Only
numeric, explicit `paddingTop`/`paddingBottom` participate. `padding`/`paddingVertical` shorthands are carried through
untouched and do not join the sum. Percentage `paddingTop`/`paddingBottom` are not supported: both edges always
resolve to the computed numeric total, so a percentage there is replaced rather than preserved — the same contract the
consumer implementations this util replaces have shipped with.

## mergeScrollContentInset

Prepends safe-area and chrome content padding to every edge the consumer style leaves unpadded, so consumer padding
wins.

```ts
const contentContainerStyle = mergeScrollContentInset(insets, 96, 48, { paddingHorizontal: 16 });
// paddingTop: insets.top + 96, paddingBottom: insets.bottom + 48, paddingHorizontal: 16
```

An edge counts as consumer-padded when its longhand, its axis shorthand (`paddingVertical`/`paddingHorizontal`), or
`padding` is set; the generated longhand for that edge is then omitted, because a longhand outranks a shorthand no
matter the merge order.

## Public utilities

`addScrollContentInset` stacks safe-area and chrome padding on top of consumer padding — the additive
counterpart to `mergeScrollContentInset`, selected on the scroll view via `contentInsetMode="additive"`.
`mergeRefs` fans one instance out to several refs so the chrome scroll ref can coexist with consumer refs.
`mergeScrollContentInset` composes safe-area and caller chrome padding while retaining consumer styles last;
consumer padding is applied after the generated padding, so a consumer `paddingTop` replaces the computed
safe-area+chrome inset rather than adding to it — in `'replace'` mode only; `'additive'` mode stacks instead.
`useScrollInterpolation` derives a clamped value from the chrome scroll offset, and `useScrollFadeStyle` is its
opacity sugar; both follow the provider's external `scrollY` when set and require a `ScreenChromeProvider` ancestor.

## License

This library is licensed under the [MIT License](./LICENSE.md).
