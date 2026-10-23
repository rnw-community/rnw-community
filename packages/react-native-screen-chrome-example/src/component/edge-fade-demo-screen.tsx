import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import { EdgeFadeDemoBands } from './edge-fade-demo-bands';
import { EdgeFadeDemoContent } from './edge-fade-demo-content';
import { EdgeFadeDemoControls } from './edge-fade-demo-controls';
import { useEdgeFadeScroll } from './use-edge-fade-scroll';

import type { ScreenChromeColorScheme } from '@rnw-community/react-native-screen-chrome';

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
const COMPACT_BAND_HEIGHT = 56;
const CHROME_HEIGHT = 32;
const RULER_WIDTH = 6;
const SCROLL_CONTENT_VIEWPORTS = 3;
const styles = StyleSheet.create({
    ruler: { position: 'absolute', right: 0, width: RULER_WIDTH, zIndex: 10 },
});

const next = <T,>(values: readonly T[], value: T): T => values[(values.indexOf(value) + 1) % values.length];
export const EdgeFadeDemoScreen = () => {
    const insets = useSafeAreaInsets();
    const { height: viewportHeight } = useWindowDimensions();
    const [scheme, setScheme] = useState<ScreenChromeColorScheme>('dark');
    const [background, setBackground] = useState<(typeof BACKGROUNDS)[number]>(BACKGROUNDS[0]);
    const [state, setState] = useState<(typeof STATES)[number]>('reference');
    const [isCompact, setIsCompact] = useState(false);
    const bandHeight = isCompact ? COMPACT_BAND_HEIGHT : BAND_HEIGHT;
    const {
        scrollRef,
        scrollY,
        onScroll,
        temporalPrepared,
        temporalDone,
        resetTemporalScroll,
        prepareTemporalScroll,
        startTemporalScroll,
    } = useEdgeFadeScroll(state, state === 'scrolled' || state === 'blur-only');
    const advanceState = () => {
        resetTemporalScroll();
        setState(next(STATES, state));
    };

    const prepareTemporal = () => {
        setState('scrolled');
        prepareTemporalScroll();
    };
    const rulerSegments = [
        { top: 0, height: insets.top + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { top: insets.top + CHROME_HEIGHT, height: bandHeight - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
        { bottom: 0, height: insets.bottom + CHROME_HEIGHT, backgroundColor: '#FF00FF' },
        { bottom: insets.bottom + CHROME_HEIGHT, height: bandHeight - CHROME_HEIGHT, backgroundColor: '#00FFFF' },
    ];

    return (
        <ScreenChromeProvider
            colorScheme={scheme}
            config={{ colors: { [scheme]: { solid: background.solid, wash: background.wash } } }}
            scrollY={scrollY}
        >
            <StatusBar hidden />
            <EdgeFadeDemoContent
                base={background.base}
                stripeColor={background.stripe}
                height={viewportHeight * SCROLL_CONTENT_VIEWPORTS}
                scrollRef={scrollRef}
                onScroll={onScroll}
                temporalPrepared={temporalPrepared}
                temporalDone={temporalDone}
            />
            {state === 'reference' ? null : (
                <EdgeFadeDemoBands
                    bandHeight={bandHeight}
                    isBlurOnly={state === 'blur-only'}
                    isTemporal={temporalPrepared}
                />
            )}
            {rulerSegments.map(segment => (
                <View key={JSON.stringify(segment)} style={[styles.ruler, segment]} />
            ))}
            <EdgeFadeDemoControls
                backgroundLabel={`${background.name}:${background.rgb.join(',')}`}
                onScheme={() => void setScheme(next(SCHEMES, scheme))}
                onBackground={() => void setBackground(next(BACKGROUNDS, background))}
                onState={advanceState}
                onCompact={() => {
                    setIsCompact(value => !value);
                }}
                onPrepare={prepareTemporal}
                onStart={startTemporalScroll}
            />
        </ScreenChromeProvider>
    );
};
