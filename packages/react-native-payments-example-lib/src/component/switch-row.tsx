import React from 'react';
import { Switch, Text, View, type ViewStyle, useColorScheme } from 'react-native';

import type { ReactNode } from 'react';

interface SwitchRowProps {
    readonly setValue: (val: boolean) => void;
    readonly text: string;
    readonly value: boolean;
}

const viewStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
};

export const SwitchRow = ({ text, value, setValue }: SwitchRowProps): ReactNode => {
    const colorScheme = useColorScheme();

    const textStyle = { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' };

    return (
        <View style={viewStyle}>
            <Text style={textStyle}>{text}</Text>

            <Switch
                ios_backgroundColor="#3e3e3e"
                onValueChange={setValue}
                trackColor={{ false: '#767577', true: '#5BC236' }}
                value={value}
            />
        </View>
    );
};
