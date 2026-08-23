import React from 'react';
import { Pressable, Text } from 'react-native';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

interface Props {
    readonly onPress: () => void;
    readonly target: string;
    readonly testID: string;
}

export const ChromeDemoLink = ({ onPress, target, testID }: Props) => (
    <Pressable onPress={onPress} style={styles.homeButton} testID={testID}>
        <Text style={styles.homeButtonText}>{target}</Text>
    </Pressable>
);
