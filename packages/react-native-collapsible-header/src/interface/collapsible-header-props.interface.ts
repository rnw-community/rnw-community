import type { CollapsibleHeaderMotionConfig } from './collapsible-header-motion-config.interface';
import type { CollapsibleHeaderMode } from '../type/collapsible-header-mode.type';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Configures the geometry, content, behavior, and layer styling of a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprops
 */
export interface CollapsibleHeaderProps extends Omit<ViewProps, 'children'> {
    /** Caller-owned vertical scroll offset; omit to use the nearest `CollapsibleHeaderProvider`. */
    readonly scrollY?: SharedValue<number>;
    /** Content visible at the expanded endpoint. */
    readonly expandedContent: ReactNode;
    /** Content visible at the collapsed endpoint. */
    readonly collapsedContent: ReactNode;
    /** Content mounted once above both transition layers for actions or shared chrome. */
    readonly persistentContent?: ReactNode;
    /** Positive expanded header height. */
    readonly expandedHeight: number;
    /** Positive collapsed header height, not greater than `expandedHeight`. */
    readonly collapsedHeight: number;
    /**
     * Positive scroll distance over which the transition completes.
     * @defaultValue `expandedHeight - collapsedHeight`
     */
    readonly collapseDistance?: number;
    /**
     * Non-negative scroll offset where the collapse begins.
     * @defaultValue `0`
     */
    readonly collapseStart?: number;
    /**
     * Layout strategy: `flow` participates in layout, `overlay` pins the header above the scrollable.
     * @defaultValue `'flow'`
     */
    readonly mode?: CollapsibleHeaderMode;
    /**
     * Snaps the scrollable to the nearest endpoint when scrolling settles mid-transition; requires `CollapsibleHeaderProvider`.
     * @defaultValue `false`
     */
    readonly snap?: boolean;
    /**
     * Stretches the header height while the scrollable overscrolls above its top edge.
     * @defaultValue `false`
     */
    readonly stretchOnOverscroll?: boolean;
    /** Optional normalized transition thresholds and endpoint transforms. */
    readonly motion?: Partial<CollapsibleHeaderMotionConfig>;
    /** Style for the height-animated header layer. */
    readonly headerStyle?: StyleProp<ViewStyle>;
    /** Style for the background fade layer. */
    readonly backgroundStyle?: StyleProp<ViewStyle>;
    /** Style for the expanded content layer. */
    readonly expandedContentContainerStyle?: StyleProp<ViewStyle>;
    /** Style for the collapsed content layer. */
    readonly collapsedContentContainerStyle?: StyleProp<ViewStyle>;
    /** Style for the persistent content layer mounted above both transition layers. */
    readonly persistentContentContainerStyle?: StyleProp<ViewStyle>;
}
