import React from 'react';
import { View } from 'react-native';

import { collapsibleHeaderSlotStyles } from './collapsible-header-slot.styles';

import type { ReactNode } from 'react';

interface Props {
    readonly children?: ReactNode;
    readonly testID?: string;
}

/**
 * Renders one persistent leading or trailing control slot in a collapsible header.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#collapsibleheaderslot
 */
export const CollapsibleHeaderSlot = ({ children, testID }: Props): ReactNode => (
    <View style={collapsibleHeaderSlotStyles.slot} testID={testID}>
        {children}
    </View>
);
