import type Animated from 'react-native-reanimated';
import type { AnimatedRef, ScrollHandlerProcessed, SharedValue } from 'react-native-reanimated';

/**
 * Exposes the provider-owned scroll wiring for attaching a scrollable to a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#usecollapsibleheaderscroll
 */
export interface CollapsibleHeaderScroll {
    /** Provider-owned vertical scroll offset consumed by descendant headers. */
    readonly scrollY: SharedValue<number>;
    /** Scroll handler to attach to the scrollable's `onScroll`. */
    readonly onScroll: ScrollHandlerProcessed;
    /** Animated ref to attach to the scrollable so snapping can drive it. */
    readonly scrollRef: AnimatedRef<Animated.ScrollView>;
}
