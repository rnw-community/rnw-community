import React from 'react';
import { View } from 'react-native';

import { collapsibleHeaderSlotStyles } from './collapsible-header-slot.styles';

import type { ReactNode } from 'react';

interface Props {
    readonly children?: ReactNode;
}

/**
 * Renders one persistent leading or trailing control slot in a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheader
 */
export const CollapsibleHeaderSlot = ({ children }: Props): ReactNode => (
    <View style={collapsibleHeaderSlotStyles.slot}>{children}</View>
);
