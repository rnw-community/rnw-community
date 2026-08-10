import React from 'react';
import { Switch, Text, View } from 'react-native';

import { demoStyle } from '../constant/demo-style';

import type { OnEventFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';

interface SwitchRowProps {
    readonly onToggle: OnEventFn<boolean>;
    readonly testID: string;
    readonly text: string;
    readonly value: boolean;
}

const trackColor = { false: '#767577', true: '#5BC236' };

export const SwitchRow = ({ text, value, testID, onToggle }: SwitchRowProps): ReactNode => (
    <View style={demoStyle.row}>
        <Text style={demoStyle.text}>{text}</Text>

        <Switch
            ios_backgroundColor="#3e3e3e"
            onValueChange={onToggle}
            testID={testID}
            trackColor={trackColor}
            value={value}
        />
    </View>
);
