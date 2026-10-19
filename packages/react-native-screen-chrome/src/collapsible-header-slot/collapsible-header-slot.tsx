import React from 'react';
import { View } from 'react-native';

import { collapsibleHeaderSlotStyles } from './collapsible-header-slot.styles';

import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

interface Props extends Omit<ViewProps, 'pointerEvents'> {
    readonly children?: ReactNode;
}

/**
 * Renders one persistent leading or trailing control slot in a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheaderslot
 */
export const CollapsibleHeaderSlot = ({ children, style, ...viewProps }: Props): ReactNode => (
    <View {...viewProps} style={[collapsibleHeaderSlotStyles.slot, style]} pointerEvents="box-none">
        {children}
    </View>
);

CollapsibleHeaderSlot.screenChromeSlotKind = 'control' as const;
