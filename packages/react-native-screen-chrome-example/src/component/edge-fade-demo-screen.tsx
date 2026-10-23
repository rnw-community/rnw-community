import React, { useEffect, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
    scrollTo,
    useAnimatedReaction,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EdgeFade, ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import type { EdgeFadeBandRenderPropsInterface, ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

const SCHEMES: readonly ScreenChromeColorScheme[] = ['dark', 'light'];
const VIVID_BACKGROUND_RGB = { red: 10, green: 132, blue: 255 };
const BACKGROUNDS = [
    {
        name: 'dark',
        base: '#101010',
        rgb: [16, 16, 16],
        solid: 'rgba(16,16,16,0.4)',
        wash: 'rgba(16,16,16,0.08)',
        stripe: '#E0E0E0',
    },
    {
        name: 'light',
        base: '#FFFFFF',
        rgb: [255, 255, 255],
        solid: 'rgba(255,255,255,0.4)',
        wash: 'rgba(255,255,255,0.08)',
        stripe: '#202020',
    },
    {
        name: 'vivid',
        base: '#0A84FF',
        rgb: [VIVID_BACKGROUND_RGB.red, VIVID_BACKGROUND_RGB.green, VIVID_BACKGROUND_RGB.blue],
        solid: 'rgba(10,132,255,0.4)',
        wash: 'rgba(10,132,255,0.08)',
        stripe: '#FF2D55',
    },
] as const;
const STATES = ['reference', 'rest', 'scrolled', 'blur-only'] as const;
const BAND_HEIGHT = 128;
const CHROME_HEIGHT = 32;
const STRIPE_WIDTH = 3;
const RULER_WIDTH = 6;
const SCROLLED_OFFSET = 200;
const TEMPORAL_SCROLL_START = 200;
const TEMPORAL_SCROLL_END = 400;
const TEMPORAL_SCROLL_DURATION = 5000;
const TEMPORAL_WITNESS_CONTENT_OFFSET = 620;
const SCROLL_CONTENT_VIEWPORTS = 3;
const FADE_ANIMATION = { opacityInputRange: [0, 40] as const };
const STRIPES = Array.from({ length: 80 }, (_, index) => index);
const TEXT_ROWS = Array.from({ length: 40 }, (_, index) => index);

const styles = StyleSheet.create({
    content: { position: 'relative' },
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
    temporalWitness: { position: 'absolute', left: 18, width: 18, height: 18, backgroundColor: '#00FF00', zIndex: 5 },
    ruler: { position: 'absolute', right: 0, width: RULER_WIDTH, zIndex: 10 },
    controls: {
        position: 'absolute',
        top: '45%',
        left: 0,
        right: RULER_WIDTH * 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    control: { backgroundColor: '#1B4D3E', paddingHorizontal: 20, paddingVertical: 12, marginHorizontal: 8 },
    controlLabel: { color: '#FFFFFF', fontWeight: '700' },
});

const next = <T,>(values: readonly T[], value: T): T => values[(values.indexOf(value) + 1) % values.length];
const renderBlurOnlyBand = ({ blur }: EdgeFadeBandRenderPropsInterface) => blur;

export const EdgeFadeDemoScreen = () => {
    const insets = useSafeAreaInsets();
    const { height: viewportHeight } = useWindowDimensions();
    const [scheme, setScheme] = useState<ScreenChromeColorScheme>('dark');
    const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]>(BACKGROUNDS[0]);
    const [state, setState] = useState<(typeof STATES)[number]>('reference');
    const [temporalPrepared, setTemporalPrepared] = useState(false);
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollY = useSharedValue(0);
    const temporalScrollY = useSharedValue(0);
    const temporalScrollActive = useSharedValue(false);
    const blurOnlyRenderBand = state === 'blur-only' ? { renderBand: renderBlurOnlyBand } : {};
    const onScroll = useAnimatedScrollHandler({ onScroll: event => scrollY.set(event.contentOffset.y) });
    useAnimatedReaction(
        () => (temporalScrollActive.get() ? temporalScrollY.get() : -1),
        offset => {
            if (offset >= 0) {
                scrollTo(scrollRef, 0, offset, false);
            }
        }
    );
    const scrollContentHeight = viewportHeight * SCROLL_CONTENT_VIEWPORTS;

    useEffect(() => {
        temporalScrollActive.set(false);
        const offset = state === 'scrolled' || state === 'blur-only' ? SCROLLED_OFFSET : 0;

        temporalScrollY.set(offset);
        scrollRef.current?.scrollTo({ y: offset, animated: false });
    }, [state, scrollRef, temporalScrollActive, temporalScrollY]);

    const advanceState = () => {
        setTemporalPrepared(false);
        temporalScrollActive.set(false);
        temporalScrollY.set(0);
        setState(next(STATES, state));
    };

    const prepareTemporalScroll = () => {
        setState('scrolled');
        setTemporalPrepared(true);
        temporalScrollActive.set(false);
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        scrollRef.current?.scrollTo({ y: TEMPORAL_SCROLL_START, animated: false });
    };

    const startTemporalScroll = () => {
        temporalScrollY.set(TEMPORAL_SCROLL_START);
        temporalScrollActive.set(true);
        temporalScrollY.set(withTiming(TEMPORAL_SCROLL_END, { duration: TEMPORAL_SCROLL_DURATION }));
    };

    const rulerSegments = [
        { top: 0, height: insets.top + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { top: insets.top + CHROME_HEIGHT, height: BAND_HEIGHT - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
        { bottom: 0, height: insets.bottom + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { bottom: insets.bottom + CHROME_HEIGHT, height: BAND_HEIGHT - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
    ];

    return (
        <ScreenChromeProvider
            colorScheme={scheme}
            config={{ colors: { [scheme]: { solid: background.solid, wash: background.wash } } }}
            scrollY={scrollY}
        >
            <StatusBar hidden />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: background.base }]}>
                <Animated.ScrollView
                    ref={scrollRef}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    style={StyleSheet.absoluteFill}
                    contentContainerStyle={{ height: scrollContentHeight }}
                >
                    <View style={[styles.content, { height: scrollContentHeight }]} testID="edge-fade-harness">
                        <View style={styles.pattern}>
                            {STRIPES.map(stripe => (
                                <View key={stripe} style={[styles.stripe, { backgroundColor: background.stripe }]} />
                            ))}
                        </View>
                        {temporalPrepared ? (
                            <View
                                style={[styles.temporalWitness, { top: TEMPORAL_WITNESS_CONTENT_OFFSET }]}
                                testID="edge-fade-harness-temporal-witness"
                            />
                        ) : null}
                    </View>
                </Animated.ScrollView>
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
                        {...blurOnlyRenderBand}
                    />
                    <EdgeFade
                        position="bottom"
                        height={BAND_HEIGHT}
                        chromeHeight={CHROME_HEIGHT}
                        scrollAnimation={FADE_ANIMATION}
                        {...blurOnlyRenderBand}
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
                    accessibilityLabel={`${background.name}:${background.rgb.join(',')}`}
                >
                    <Text style={styles.controlLabel}>Background</Text>
                </Pressable>
                <Pressable onPress={advanceState} style={styles.control} testID="edge-fade-harness-state">
                    <Text style={styles.controlLabel}>State</Text>
                </Pressable>
                <Pressable
                    onPress={prepareTemporalScroll}
                    style={styles.control}
                    testID="edge-fade-harness-temporal-prepare"
                >
                    <Text style={styles.controlLabel}>Prepare temporal</Text>
                </Pressable>
                <Pressable onPress={startTemporalScroll} style={styles.control} testID="edge-fade-harness-temporal">
                    <Text style={styles.controlLabel}>Temporal</Text>
                </Pressable>
            </View>
        </ScreenChromeProvider>
    );
};
