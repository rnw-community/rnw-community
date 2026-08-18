import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CollapsibleHeader as GenericCollapsibleHeader } from '@rnw-community/react-native-collapsible-header';

import { useScreenChrome } from '../hook/use-screen-chrome.hook';
import { getCollapsibleHeaderMotion } from '../utils/get-collapsible-header-motion.util';
import { getCollapsibleHeaderSlots } from '../utils/get-collapsible-header-slots.util';

import { collapsibleHeaderStyles } from './collapsible-header.styles';

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
    const { config } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const { leading, expandedTitle, collapsedTitle, trailing } = getCollapsibleHeaderSlots(children);
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
            mode="overlay"
            snap={config.snapToCollapse}
            expandedHeight={config.headerHeight}
            collapsedHeight={config.headerHeight}
            collapseStart={config.collapseStart}
            collapseDistance={config.collapseEnd - config.collapseStart}
            expandedContent={expandedTitle}
            collapsedContent={collapsedTitle}
            persistentContent={persistentContent}
            motion={getCollapsibleHeaderMotion(config)}
            headerStyle={{ paddingTop: insets.top }}
            expandedContentContainerStyle={collapsibleHeaderStyles.titleLayer}
            collapsedContentContainerStyle={collapsibleHeaderStyles.titleLayer}
        />
    );
};
