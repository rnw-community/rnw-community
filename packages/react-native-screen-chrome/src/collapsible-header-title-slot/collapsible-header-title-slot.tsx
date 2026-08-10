import React from 'react';
import { View } from 'react-native';

import { collapsibleHeaderTitleSlotStyles } from './collapsible-header-title-slot.styles';

import type { ReactNode } from 'react';

interface Props {
    readonly children: ReactNode;
}

/**
 * Groups the direct large and small title layers of a compound collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeaderTitleSlot = ({ children }: Props): ReactNode => (
    <View style={collapsibleHeaderTitleSlotStyles.slot} pointerEvents="box-none">
        {children}
    </View>
);
