import type { ScrollContentInsetMode } from '../type/scroll-content-inset-mode.type';
import type { Ref } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

/**
 * Configures the chrome content padding and consumer ref that `useScreenChromeScrollProps` composes into scroll props.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#screenchromescrollpropsoptionsinterface
 */
export interface ScreenChromeScrollPropsOptionsInterface<T = unknown> {
    /** Chrome padding added below the top safe-area inset. @defaultValue `0` */
    readonly contentInsetTop?: number;
    /** Chrome padding added above the bottom safe-area inset. @defaultValue `0` */
    readonly contentInsetBottom?: number;
    /** Whether the computed padding replaces or stacks on consumer padding. @defaultValue `'replace'` */
    readonly contentInsetMode?: ScrollContentInsetMode;
    /** Consumer content container style composed with the computed padding. */
    readonly contentContainerStyle?: StyleProp<ViewStyle>;
    /** Whether the top safe-area inset is added, `false` when an in-flow header above the scrollable already pads it. @defaultValue `true` */
    readonly includeTopSafeArea?: boolean;
    /** Consumer ref attached to the scrollable alongside the chrome scroll ref. */
    readonly ref?: Ref<T>;
}
