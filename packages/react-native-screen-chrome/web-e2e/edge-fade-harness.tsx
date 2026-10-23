import React from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EdgeFade, ScreenChromeProvider } from '../src';

import type { ReactNode } from 'react';

declare global {
    interface Window {
        setEdgeFadeScrollY?: (offset: number) => void;
    }
}

const SAFE_AREA_METRICS = {
    frame: { x: 0, y: 0, width: 400, height: 600 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
};
const SCREEN_BACKGROUND_COLOR = 'var(--screen-background)';
const CONTENT_LINES = Array.from({ length: 40 }, (_, index) => `Scrolled content line ${index + 1}`);

document.documentElement.style.setProperty('--screen-background', '#ffffff');

const styles = StyleSheet.create({
    screen: { width: 400, height: 600, overflow: 'hidden', backgroundColor: '#ffffff' },
    line: { fontSize: 18, lineHeight: 24, color: '#000000' },
    stripes: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 200,
        backgroundImage: 'repeating-linear-gradient(to right, #000000 0px 20px, #ffffff 20px 40px)',
    },
});

const Harness = (): ReactNode => {
    const scrollY = useSharedValue(0);

    window.setEdgeFadeScrollY = offset => scrollY.set(offset);

    return (
        <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
            <ScreenChromeProvider
                colorScheme="light"
                config={{ colors: { light: { solid: SCREEN_BACKGROUND_COLOR, wash: SCREEN_BACKGROUND_COLOR } } }}
                scrollY={scrollY}
            >
                <View testID="screen" style={styles.screen}>
                    <View testID="stripes" style={styles.stripes} />
                    {CONTENT_LINES.map(line => (
                        <Text key={line} style={styles.line}>
                            {line}
                        </Text>
                    ))}
                    <EdgeFade testID="top-fade" position="top" />
                    <EdgeFade testID="bottom-fade" position="bottom" scrollAnimation={{ opacityInputRange: [0, 80] }} />
                </View>
            </ScreenChromeProvider>
        </SafeAreaProvider>
    );
};

const container = document.getElementById('root');

if (container !== null) {
    createRoot(container).render(<Harness />);
}
