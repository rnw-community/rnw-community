import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';
import { getCollapsibleHeaderMotion } from '../util/get-collapsible-header-motion/get-collapsible-header-motion.util';
import { getCollapsibleHeaderSlots } from '../util/get-collapsible-header-slots/get-collapsible-header-slots.util';
import { getExpandedTitleLayerStyle } from '../util/get-expanded-title-layer-style/get-expanded-title-layer-style.util';

import { collapsibleHeaderStyles } from './collapsible-header.styles';

import type { ExpandedTitleAlignment } from '../type/expanded-title-alignment.type';
import type { CollapsibleHeaderMotionConfig } from '@rnw-community/react-native-collapsible-header';
import type { ReactNode } from 'react';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

interface Props extends Omit<ViewProps, 'children'> {
    readonly children: ReactNode;
    readonly motion?: Partial<CollapsibleHeaderMotionConfig>;
    readonly expandedTitleAlignment?: ExpandedTitleAlignment;
    readonly expandedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly collapsedContentContainerStyle?: StyleProp<ViewStyle>;
    readonly persistentContentContainerStyle?: StyleProp<ViewStyle>;
    readonly persistentRowStyle?: StyleProp<ViewStyle>;
}

/**
 * Composes safe-area-aware title and control slots through the generic collapsible-header primitive.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeader = ({
    children,
    motion,
    expandedTitleAlignment = 'center',
    persistentRowStyle,
    style,
    expandedContentContainerStyle,
    collapsedContentContainerStyle,
    persistentContentContainerStyle,
    ...viewProps
}: Props): ReactNode => {
    const { config } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const { leading, expandedTitle, collapsedTitle, trailing } = getCollapsibleHeaderSlots(children);
    const contentLayerStyle = { top: insets.top };
    const vacantSlot = <View pointerEvents="none" />;
    const persistentContent = (
        <View style={[collapsibleHeaderStyles.persistentRow, persistentRowStyle]} pointerEvents="box-none">
            {leading ?? vacantSlot}
            {trailing ?? vacantSlot}
        </View>
    );

    return (
        <GenericCollapsibleHeader
            {...viewProps}
            pointerEvents="box-none"
            style={[collapsibleHeaderStyles.container, style]}
            mode="overlay"
            snap={config.snapToCollapse}
            expandedHeight={insets.top + config.headerHeight}
            collapsedHeight={insets.top + (config.collapsedHeaderHeight ?? config.headerHeight)}
            collapseStart={config.collapseStart}
            collapseDistance={config.collapseEnd - config.collapseStart}
            expandedContent={expandedTitle}
            collapsedContent={collapsedTitle}
            persistentContent={persistentContent}
            motion={{ ...getCollapsibleHeaderMotion(config), ...motion }}
            expandedContentContainerStyle={[
                collapsibleHeaderStyles.expandedTitleLayer,
                getExpandedTitleLayerStyle(expandedTitleAlignment, leading, trailing),
                contentLayerStyle,
                expandedContentContainerStyle,
            ]}
            collapsedContentContainerStyle={[
                collapsibleHeaderStyles.titleLayer,
                contentLayerStyle,
                collapsedContentContainerStyle,
            ]}
            persistentContentContainerStyle={[contentLayerStyle, persistentContentContainerStyle]}
        />
    );
};
