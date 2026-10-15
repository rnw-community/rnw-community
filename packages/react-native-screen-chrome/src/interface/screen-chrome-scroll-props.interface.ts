import type { RefCallback } from 'react';
import type { Insets, StyleProp, ViewStyle } from 'react-native';
import type { ScrollHandlerProcessed } from 'react-native-reanimated';

/**
 * Scroll props that wire any Reanimated-animated scrollable into the screen chrome when spread onto it.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollpropsinterface
 */
export interface ScreenChromeScrollPropsInterface<T = unknown> {
    /** Merged callback ref that attaches the chrome scroll ref and the consumer ref together. */
    readonly ref: RefCallback<T>;
    /** Provider-owned worklet scroll handler driving the collapsible header. */
    readonly onScroll: ScrollHandlerProcessed;
    /** Scroll event rate from the provider configuration. */
    readonly scrollEventThrottle: number;
    /** Safe-area and chrome padding composed with the consumer content container style. */
    readonly contentContainerStyle: StyleProp<ViewStyle>;
    /** iOS scroll indicator insets matching the safe-area and chrome top and bottom padding. */
    readonly scrollIndicatorInsets: Insets;
    /** Disables iOS automatic indicator insets so `scrollIndicatorInsets` applies as given. */
    readonly automaticallyAdjustsScrollIndicatorInsets: false;
}
