import React from 'react';
import { View } from 'react-native';

import { collapsibleHeaderSlotStyles } from './collapsible-header-slot.styles.js';

import type { ReactNode } from 'react';

interface Props {
    readonly children?: ReactNode;
}

export const CollapsibleHeaderSlot = ({ children }: Props): ReactNode => (
    <View style={collapsibleHeaderSlotStyles.slot}>{children}</View>
);
