import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';

import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';
import { getCollapsibleHeaderSlots } from '../utils/get-collapsible-header-slots.util.js';

import { collapsibleHeaderStyles } from './collapsible-header.styles.js';

import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

interface Props extends Omit<ViewProps, 'children'> {
    readonly children: ReactNode;
}

/**
 * Composes safe-area-aware title and control slots through the generic collapsible-header primitive.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeader = ({ children, style, ...viewProps }: Props): ReactNode => {
    const { config, scrollY } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const { leading, expandedTitle, collapsedTitle, trailing } = getCollapsibleHeaderSlots(children);
    const collapseDistance = config.collapseEnd - config.collapseStart;
    const motion = {
        expandedOpacityEndProgress: (config.largeTitleEnd - config.collapseStart) / collapseDistance,
        collapsedOpacityStartProgress: (config.smallTitleStart - config.collapseStart) / collapseDistance,
        backgroundOpacityStartProgress: 1,
        pointerEventsSwitchProgress: 0.5,
        expandedTranslateY: 0,
        expandedScale: 1,
        collapsedTranslateY: 0,
    };
    const persistentContent = (
        <View style={collapsibleHeaderStyles.persistentRow} pointerEvents="box-none">
            {leading}
            <View style={collapsibleHeaderStyles.titleSpacer} pointerEvents="none" />
            {trailing}
        </View>
    );

    return (
        <GenericCollapsibleHeader
            {...viewProps}
            pointerEvents="box-none"
            style={[collapsibleHeaderStyles.container, style]}
            scrollY={scrollY}
            expandedHeight={config.headerHeight}
            collapsedHeight={config.headerHeight}
            collapseStart={config.collapseStart}
            collapseDistance={collapseDistance}
            expandedContent={expandedTitle}
            collapsedContent={collapsedTitle}
            persistentContent={persistentContent}
            motion={motion}
            headerStyle={{ paddingTop: insets.top }}
            expandedContentContainerStyle={collapsibleHeaderStyles.titleLayer}
            collapsedContentContainerStyle={collapsibleHeaderStyles.titleLayer}
        />
    );
};
