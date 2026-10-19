import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';

import {
    EdgeFade,
    ScreenChromeFrame,
    ScreenChromeHeader,
    ScreenChromeProvider,
    useScreenChromeHeaderMetrics,
} from '@rnw-community/react-native-screen-chrome';

import { CHROME_DEMO_STYLES as styles } from '../constant/chrome-demo-style';

import { ChromeDemoList } from './chrome-demo-list';

import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

const ThemeDemoContent = ({ colorScheme }: { readonly colorScheme: ScreenChromeColorScheme }) => {
    const headerTotalHeight = useScreenChromeHeaderMetrics();

    return <ChromeDemoList colorScheme={colorScheme} contentInsetTop={headerTotalHeight} testID="theme-demo-scroll" />;
};

export const ThemeDemoScreen = () => {
    const [colorScheme, setColorScheme] = useState<ScreenChromeColorScheme>('light');
    const isDark = colorScheme === 'dark';

    return (
        <ScreenChromeProvider colorScheme={colorScheme}>
            <ScreenChromeFrame style={isDark ? styles.screenDark : styles.screenLight}>
                <ThemeDemoContent colorScheme={colorScheme} />
                <EdgeFade position="top" testID="theme-demo-top-fade" />
                <EdgeFade position="bottom" testID="theme-demo-bottom-fade" />
                <ScreenChromeHeader style={styles.headerBackdrop} testID="theme-demo-header">
                    <Text style={styles.slotText} testID="theme-demo-scheme">
                        {isDark ? 'Dark' : 'Light'}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => void setColorScheme(isDark ? 'light' : 'dark')}
                        testID="theme-demo-toggle"
                    >
                        <Text style={styles.slotText}>Switch</Text>
                    </Pressable>
                </ScreenChromeHeader>
            </ScreenChromeFrame>
        </ScreenChromeProvider>
    );
};
