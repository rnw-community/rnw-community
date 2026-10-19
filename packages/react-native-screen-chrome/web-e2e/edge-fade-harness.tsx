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
const CONTENT_LINES = Array.from({ length: 40 }, (_, index) => `Scrolled content line ${index + 1}`);

const styles = StyleSheet.create({
    screen: { width: 400, height: 600, overflow: 'hidden', backgroundColor: '#ffffff' },
    line: { fontSize: 18, lineHeight: 24, color: '#000000' },
});

const Harness = (): ReactNode => {
    const scrollY = useSharedValue(0);

    window.setEdgeFadeScrollY = offset => scrollY.set(offset);

    return (
        <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
            <ScreenChromeProvider scrollY={scrollY}>
                <View testID="screen" style={styles.screen}>
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
