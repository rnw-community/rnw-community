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
    @react-native-masked-view/masked-view expo-blur expo-linear-gradient \
    react-native-reanimated react-native-safe-area-context
```

The native libraries and `@rnw-community/react-native-collapsible-header` are peer dependencies and must be installed
by the host application: the application must resolve exactly one copy of the collapsible header, otherwise its scroll
context has two identities and the chrome components fail to find their provider. Reanimated 4 applications also
install `react-native-worklets` and configure `react-native-worklets/plugin`.

`expo-blur` must be `>=55 <59`: the `blurMethod` prop and the `BlurMethod` type this package passes and re-exports in
`EdgeFadePropsInterface` only exist from that release, which renamed `experimentalBlurMethod` to `blurMethod`.

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
by the row padding plus the slot size on the side of each non-empty slot, so it never sits under a control and uses the
space of an empty slot. The collapsed title stays centered.

```tsx
<CollapsibleHeader expandedTitleAlignment="start">{/* slots */}</CollapsibleHeader>
```

`expandedContentContainerStyle`, `collapsedContentContainerStyle` and `persistentContentContainerStyle` are forwarded to
the primitive and merged after those defaults, so a consumer style always wins. Derive custom offsets from
[`SCREEN_CHROME_HEADER_LAYOUT_METRICS`](#screen_chrome_header_layout_metrics) instead of copying the numbers.

## Compound header contract

`CollapsibleHeader` requires exactly one `CollapsibleHeaderTitleSlot` direct child and accepts at most one
`CollapsibleHeaderSlot` before it (the leading control) and at most one after it (the trailing control). The title slot
must directly contain the expanded title followed by the collapsed title. `null`, `false`, and `undefined` children are
ignored, so `{canGoBack && <CollapsibleHeaderSlot>…</CollapsibleHeaderSlot>}` works; fragments, host views, and
unmarked wrapper components are rejected so slot discovery stays deterministic.

Slots are recognized by a stable string marker, `screenChromeSlotKind` (a [`CollapsibleHeaderSlotKind`](#collapsibleheaderslotkind)),
that each slot component carries as a static property — `'control'` for `CollapsibleHeaderSlot`, `'title'` for
`CollapsibleHeaderTitleSlot` — with component identity used only as a fast path. Two resolved copies of this package in
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
`minWidth`/`minHeight` makes the rendered control responsible for its own touch target.

## CollapsibleHeaderTitleSlot

Groups the direct expanded and collapsed title layers of a compound collapsible header; title opacity and pointer-event
handoff between them are delegated to `@rnw-community/react-native-collapsible-header`.

```tsx
<CollapsibleHeaderTitleSlot>
    <Text>Accounts</Text>
    <Text>Accounts</Text>
</CollapsibleHeaderTitleSlot>
```

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

Every `EdgeFade` prop except `position` is forwarded, so `testID`, `style`, `blurTarget`, and `renderBand` reach the
band; `height` and `scrollAnimation` replace the header-derived defaults only when supplied:

```tsx
<CollapsibleHeaderBackdrop testID="header-backdrop" blurTarget={blurTarget} renderBand={renderSolidBand} />
```

## CollapsibleHeaderBackdropPropsInterface

`Omit<EdgeFadePropsInterface, 'position'>`: `height` defaults to `headerBackdropHeight`, and `scrollAnimation` defaults
to opacity over `collapseStart`–`smallTitleStart` and blur intensity over `collapseStart`–`collapseEnd`.

```tsx
const backdropProps: CollapsibleHeaderBackdropPropsInterface = { testID: 'header-backdrop', height: 120 };
```

## Edge fades

Native edge fades use Masked View, Expo Linear Gradient, and Expo Blur. They ignore pointer events and accessibility
traversal. Web edge fades use CSS mask images and backdrop filtering; scroll animation changes opacity while blur stays
static. Native defaults use 150-point top and bottom bands, while web defaults use 76-pixel bands.

## EdgeFade

Renders a decorative top or bottom blur band, scroll-animatable through `scrollAnimation`.

```tsx
<EdgeFade position="bottom" height={96} scrollAnimation={{ opacityInputRange: [0, 80] }} />
```

On web only `scrollAnimation.opacityInputRange` animates: the band's `backdrop-filter` is a static blur derived from
`intensity`, so `intensityInputRange` and `maxIntensity` have no effect there. Animated web blur is tracked in
[#591](https://github.com/rnw-community/rnw-community/issues/591).

Android blur is opt-in through `blurTarget`. Since `expo-blur@55` the `dimezisBlurView` methods only blur the
background of a `BlurTargetView`, so `blurMethod` defaults to `'dimezisBlurView'` when a `blurTarget` ref is supplied
and to `'none'` otherwise — expo-blur itself falls back to `'none'` with a console warning when a targeted method has
no target, and that fallback is what the default avoids:

```tsx
const blurTarget = useRef<View>(null);

<BlurTargetView ref={blurTarget}>{content}</BlurTargetView>
<EdgeFade position="top" blurTarget={blurTarget} />;
```

### Custom band content

`renderBand` replaces the band content while the package keeps the band metrics, absolute positioning, safe-area
offset, scroll-driven opacity, and the inert pointer/accessibility props on the container. The renderer receives the
resolved visuals (`EdgeFadeBandRenderPropsInterface`), including the animated `blur` element and the complete
`defaultBand`, so a renderer can wrap, compose, or conditionally fall back to the package output. Pass it per
instance, or once on `ScreenChromeProvider` as `renderEdgeFadeBand`; the per-instance prop wins. Without either, the
output is unchanged. Web honours the same contract: the CSS backdrop filter, mask, and wash move off the container
into `blur` (backdrop filter only) and `defaultBand` (everything) when a renderer is set.

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
| `intensity`       | `number`                           | Static blur intensity; ignored while `scrollAnimation` drives it.                    |
| `scrollAnimation` | `EdgeFadeScrollAnimationInterface` | Optional scroll-driven opacity and blur intensity ranges.                            |
| `blurMethod`      | `BlurMethod`                       | Android Expo Blur rendering method; defaults from `blurTarget`.                      |
| `blurTarget`      | `RefObject<View \| null>`          | Android `BlurTargetView` ref the band blurs; required by `dimezisBlurView` methods.  |
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
| `tint`          | `BlurTint`                       | Expo Blur tint the default band uses.                                  |
| `washColors`    | `readonly [string, string]`      | Wash gradient colors from top to bottom, solid at the screen edge.     |
| `maskColors`    | `readonly [string, string, ...]` | Mask colors from the config's `maskStops` for this position, sorted.   |
| `maskLocations` | `readonly [number, number, ...]` | Mask locations matching `maskColors`.                                  |
| `blur`          | `ReactNode`                      | The package's blur element with its static or scroll-driven intensity. |
| `defaultBand`   | `ReactNode`                      | The package's complete default band (masked blur and wash on native).  |

Recompose the mask and wash around the package's animated blur, for example with an extra overlay layer:

```tsx
const renderTintedBand: EdgeFadeBandRenderer = ({ blur, washColors, maskColors, maskLocations }) => (
    <MaskedView
        style={{ flex: 1 }}
        maskElement={<LinearGradient colors={maskColors} locations={maskLocations} style={{ flex: 1 }} />}
    >
        {blur}
        <LinearGradient colors={washColors} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,122,255,0.08)' }]} />
    </MaskedView>
);
```

## getEdgeFadeBandMetrics

Resolves the height and safe-area offset an edge-fade band uses — `height` (fade height plus the edge inset) and a
negative `top` or `bottom` offset — for custom bands positioned outside `EdgeFade`.

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

## ScreenChromeHeader

Renders a static, non-collapsible header row with the same safe-area and paint-order contract as the collapsible one:
absolute at the top, `zIndex: 3`, `box-none`, sized to `insets.top + topInset + headerHeight` so
`getScreenChromeHeaderMetrics` predicts its footprint exactly. `topInset` adds app-owned padding beyond the safe area
for screens that nest under an already-padded container. Requires a `ScreenChromeProvider` ancestor.

```tsx
<ScreenChromeHeader testID="header" topInset={10} style={styles.headerBackground}>
    <Button onPress={goBack} title="Back" />
    <Text>{title}</Text>
</ScreenChromeHeader>
```

## ScreenChromeProvider

Provides validated configuration and color scheme to screen chrome components around one scrollable.

```tsx
<ScreenChromeProvider colorScheme="dark" config={{ snapToCollapse: true }}>
    {children}
</ScreenChromeProvider>
```

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

The scroll view also sets `scrollIndicatorInsets` to the same safe-area+chrome top and bottom insets (with
`automaticallyAdjustsScrollIndicatorInsets={false}`), so the iOS scroll indicator never runs under the header or the
bottom inset; pass either prop to override it.

Change the event rate through
`<ScreenChromeProvider config={{ scrollEventThrottle: 8 }}>`. The provider's `onScroll` is one processed Reanimated
handler that also carries drag and snap events, so it is attached whole rather than wrapped — read the scroll position
from the shared `scrollY` instead:

```tsx
const { scrollY } = useCollapsibleHeaderScroll();

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

The `{ colorScheme, config, renderEdgeFadeBand? }` shape returned by `useScreenChrome`.

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
`CollapsibleHeader` scrolls freely. Snap animation currently ignores the reduced-motion setting.

## SCREEN_CHROME_DEFAULT_CONFIG

The platform default `ScreenChromeConfigInterface`: native (`screen-chrome-default-config.constant.ts`) uses 150-point top and
bottom fade bands and a 220-point header backdrop; web (`screen-chrome-default-config.constant.web.ts`) uses 76-pixel bands and a
108-pixel backdrop. `mergeScreenChromeConfig` starts from this value.

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

Prepends safe-area and chrome content padding while preserving consumer styles after generated padding.

```ts
const contentContainerStyle = mergeScrollContentInset(insets, 96, 48, { paddingHorizontal: 16 });
```

## Public utilities

`addScrollContentInset` stacks safe-area and chrome padding on top of consumer padding — the additive
counterpart to `mergeScrollContentInset`, selected on the scroll view via `contentInsetMode="additive"`.
`mergeRefs` fans one instance out to several refs so the chrome scroll ref can coexist with consumer refs.
`mergeScrollContentInset` composes safe-area and caller chrome padding while retaining consumer styles last;
consumer padding is applied after the generated padding, so a consumer `paddingTop` replaces the computed
safe-area+chrome inset rather than adding to it — in `'replace'` mode only; `'additive'` mode stacks instead.
`useScrollFadeStyle` creates a clamped opacity style from the collapsible-header provider scroll value and therefore
requires a `ScreenChromeProvider` ancestor.

## License

This library is licensed under the [MIT License](./LICENSE.md).
