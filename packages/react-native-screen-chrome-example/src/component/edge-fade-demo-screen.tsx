import React, { useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade, ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

const SCHEMES: readonly ScreenChromeColorScheme[] = ['dark', 'light'];
const BACKGROUNDS = [
    { name: 'dark', base: '#101010', stripe: '#E0E0E0' },
    { name: 'light', base: '#FFFFFF', stripe: '#202020' },
    { name: 'vivid', base: '#0A84FF', stripe: '#FF2D55' },
] as const;
const STATES = ['reference', 'rest', 'scrolled'] as const;
const BAND_HEIGHT = 128;
const CHROME_HEIGHT = 32;
const STRIPE_WIDTH = 3;
const RULER_WIDTH = 6;
const SCROLLED_OFFSET = 200;
const FADE_ANIMATION = { opacityInputRange: [0, 40] as const };
const STRIPES = Array.from({ length: 80 }, (_, index) => index);
const TEXT_ROWS = Array.from({ length: 40 }, (_, index) => index);

const styles = StyleSheet.create({
    pattern: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: RULER_WIDTH * 2,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    stripe: { width: STRIPE_WIDTH, marginRight: STRIPE_WIDTH },
    text: { position: 'absolute', top: 0, bottom: 0, left: 0, right: RULER_WIDTH * 2, overflow: 'hidden' },
    textRow: { fontSize: 13, lineHeight: 24, fontWeight: '700' },
    ruler: { position: 'absolute', right: 0, width: RULER_WIDTH, zIndex: 10 },
    controls: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: RULER_WIDTH * 2,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    control: { backgroundColor: '#1B4D3E', paddingHorizontal: 20, paddingVertical: 12, marginHorizontal: 8 },
    controlLabel: { color: '#FFFFFF', fontWeight: '700' },
});

const next = <T,>(values: readonly T[], value: T): T => values[(values.indexOf(value) + 1) % values.length];

export const EdgeFadeDemoScreen = () => {
    const insets = useSafeAreaInsets();
    const [scheme, setScheme] = useState<ScreenChromeColorScheme>('dark');
    const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]>(BACKGROUNDS[0]);
    const [state, setState] = useState<(typeof STATES)[number]>('reference');
    const scrollY = useSharedValue(0);

    scrollY.set(state === 'scrolled' ? SCROLLED_OFFSET : 0);

    const rulerSegments = [
        { top: 0, height: insets.top + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { top: insets.top + CHROME_HEIGHT, height: BAND_HEIGHT - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
        { bottom: 0, height: insets.bottom + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { bottom: insets.bottom + CHROME_HEIGHT, height: BAND_HEIGHT - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
    ];

    return (
        <ScreenChromeProvider colorScheme={scheme} scrollY={scrollY}>
            <StatusBar hidden />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: background.base }]} testID="edge-fade-harness">
                <View style={styles.pattern}>
                    {STRIPES.map(stripe => (
                        <View key={stripe} style={[styles.stripe, { backgroundColor: background.stripe }]} />
                    ))}
                </View>
                <View style={styles.text}>
                    {TEXT_ROWS.map(row => (
                        <Text key={row} numberOfLines={1} style={[styles.textRow, { color: background.base }]}>
                            Hamburgefonstiv 0123456789 Hamburgefonstiv
                        </Text>
                    ))}
                </View>
            </View>
            {state === 'reference' ? null : (
                <>
                    <EdgeFade
                        position="top"
                        height={BAND_HEIGHT}
                        chromeHeight={CHROME_HEIGHT}
                        scrollAnimation={FADE_ANIMATION}
                    />
                    <EdgeFade
                        position="bottom"
                        height={BAND_HEIGHT}
                        chromeHeight={CHROME_HEIGHT}
                        scrollAnimation={FADE_ANIMATION}
                    />
                </>
            )}
            {rulerSegments.map(segment => (
                <View key={JSON.stringify(segment)} style={[styles.ruler, segment]} />
            ))}
            <View style={styles.controls}>
                <Pressable
                    onPress={() => void setScheme(next(SCHEMES, scheme))}
                    style={styles.control}
                    testID="edge-fade-harness-scheme"
                >
                    <Text style={styles.controlLabel}>Scheme</Text>
                </Pressable>
                <Pressable
                    onPress={() => void setBackground(next(BACKGROUNDS, background))}
                    style={styles.control}
                    testID="edge-fade-harness-background"
                >
                    <Text style={styles.controlLabel}>Background</Text>
                </Pressable>
                <Pressable
                    onPress={() => void setState(next(STATES, state))}
                    style={styles.control}
                    testID="edge-fade-harness-state"
                >
                    <Text style={styles.controlLabel}>State</Text>
                </Pressable>
            </View>
        </ScreenChromeProvider>
    );
};
