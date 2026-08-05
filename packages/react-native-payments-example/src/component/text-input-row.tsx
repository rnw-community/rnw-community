import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { demoStyle } from '../constant/demo-style.js';

import type { OnEventFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';

interface TextInputRowProps {
    readonly onChangeText: OnEventFn<string>;
    readonly testID: string;
    readonly text: string;
    readonly value: string;
}

export const TextInputRow = ({ text, value, testID, onChangeText }: TextInputRowProps): ReactNode => (
    <View style={demoStyle.row}>
        <Text style={demoStyle.text}>{text}</Text>

        <TextInput
            keyboardType="decimal-pad"
            onChangeText={onChangeText}
            style={demoStyle.input}
            testID={testID}
            value={value}
        />
    </View>
);
