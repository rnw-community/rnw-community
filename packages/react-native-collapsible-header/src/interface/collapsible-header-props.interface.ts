import type { CollapsibleHeaderMotionConfig } from './collapsible-header-motion-config.interface.js';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

/**
 * Configures the geometry, content, and layer styling of a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheaderprops
 */
export interface CollapsibleHeaderProps extends Omit<ViewProps, 'children'> {
    readonly scrollY: SharedValue<number>;
    readonly expandedContent: ReactNode;
    readonly collapsedContent: ReactNode;
    readonly persistentContent?: ReactNode;
    readonly expandedHeight: number;
    readonly collapsedHeight: number;
    readonly collapseDistance: number;
    readonly collapseStart?: number;
    readonly motion?: Partial<CollapsibleHeaderMotionConfig>;
    readonly headerStyle?: StyleProp<ViewStyle>;
    readonly backgroundStyle?: StyleProp<ViewStyle>;
    readonly expandedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly collapsedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly persistentContentContainerStyle?: StyleProp<ViewStyle>;
}
