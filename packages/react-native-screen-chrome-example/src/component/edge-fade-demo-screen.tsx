import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { EdgeFade, ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

const STRIPE_COLUMNS = Array.from({ length: 12 }, (_, index) => index);

export const EdgeFadeDemoScreen = () => {
    const [colorScheme, setColorScheme] = useState<ScreenChromeColorScheme>('light');

    return (
        <ScreenChromeProvider colorScheme={colorScheme}>
            <View style={styles.stripes} testID="edge-fade-demo-stripes">
                {STRIPE_COLUMNS.map(column => (
                    <View key={column} style={styles.stripe} />
                ))}
            </View>
            <Pressable
                accessibilityRole="button"
                onPress={() => void setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
                style={styles.stripesToggle}
                testID="edge-fade-demo-toggle"
            >
                <Text style={styles.footerLabel}>{colorScheme === 'dark' ? 'Dark' : 'Light'}</Text>
            </Pressable>
            <EdgeFade position="top" testID="edge-fade-demo-top" />
            <EdgeFade position="bottom" testID="edge-fade-demo-bottom" />
        </ScreenChromeProvider>
    );
};
