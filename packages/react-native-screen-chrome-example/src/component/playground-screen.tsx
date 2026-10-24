import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenChromeProvider } from '@rnw-community/react-native-screen-chrome';

import { PLAYGROUND_BUDGIE_CONFIG } from '../constant/playground-budgie-config';
import { PLAYGROUND_GEOMETRY } from '../constant/playground-geometry';

import { PlaygroundBands } from './playground-bands';
import { PlaygroundContent } from './playground-content';
import { PlaygroundSliders } from './playground-sliders';
import { PlaygroundToggleButtons } from './playground-toggle-buttons';

import type { PlaygroundConfigInterface } from '../interface/playground-config.interface';
import type { PlaygroundTogglesInterface } from '../interface/playground-toggles.interface';
import type { ScrollViewInstance } from 'react-native';

const BACKGROUNDS = { dark: '#000000', light: '#F2F2F7' } as const;
const STRIPES = { dark: '#FFFFFF', light: '#000000' } as const;
const WASH_RGB = { dark: '0,0,0', light: '255,255,255' } as const;
const MINIMUM_HEADER_HEIGHT = 64;
const INITIAL_TOGGLES: PlaygroundTogglesInterface = {
    scheme: 'dark',
    isWashOn: true,
    isBlurOn: true,
    isChromeOn: true,
    isScrolled: false,
    isPanelOpen: false,
};

const styles = StyleSheet.create({
    controls: { position: 'absolute', left: 8, right: PLAYGROUND_GEOMETRY.patternMargin, top: '42%', bottom: 8, zIndex: 20 },
    ruler: { position: 'absolute', right: 0, width: PLAYGROUND_GEOMETRY.rulerWidth, zIndex: 10 },
});

const toColor = (scheme: PlaygroundTogglesInterface['scheme'], alpha: number) =>
    `rgba(${WASH_RGB[scheme]},${String(alpha)})`;

export const PlaygroundScreen = () => {
    const insets = useSafeAreaInsets();
    const scrollRef = useRef<ScrollViewInstance>(null);
    const [config, setConfig] = useState<PlaygroundConfigInterface>(PLAYGROUND_BUDGIE_CONFIG);
    const [toggles, setToggles] = useState<PlaygroundTogglesInterface>(INITIAL_TOGGLES);
    const { scheme } = toggles;
    const rulerSegments = [
        { top: 0, height: insets.top + config.topChrome, backgroundColor: '#FF00FF' },
        { top: insets.top + config.topChrome, height: config.topHeight - config.topChrome, backgroundColor: '#00FFFF' },
        { bottom: 0, height: insets.bottom + config.bottomChrome, backgroundColor: '#FF00FF' },
        {
            bottom: insets.bottom + config.bottomChrome,
            height: config.bottomHeight - config.bottomChrome,
            backgroundColor: '#00FFFF',
        },
    ];

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: toggles.isScrolled ? PLAYGROUND_GEOMETRY.scrolledOffset : 0, animated: false });
    }, [toggles.isScrolled]);

    return (
        <ScreenChromeProvider
            colorScheme={scheme}
            config={{
                headerHeight: Math.max(MINIMUM_HEADER_HEIGHT, config.topChrome),
                collapsedHeaderHeight: Math.max(1, config.topChrome),
                topFadeHeight: config.topHeight,
                headerBackdropHeight: config.topHeight,
                bottomFadeHeight: config.bottomHeight,
                intensity: config.intensity,
                maxBlurIntensity: config.maxBlurIntensity,
                colors: {
                    [scheme]: {
                        solid: toColor(scheme, config.alphas[scheme].solid),
                        wash: toColor(scheme, config.alphas[scheme].wash),
                    },
                },
            }}
        >
            <StatusBar hidden />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: BACKGROUNDS[scheme] }]}>
                <PlaygroundContent scrollRef={scrollRef} stripeColor={STRIPES[scheme]} />
            </View>
            <PlaygroundBands config={config} toggles={toggles} />
            {rulerSegments.map(segment => (
                <View key={JSON.stringify(segment)} style={[styles.ruler, segment]} />
            ))}
            <View style={styles.controls} pointerEvents="box-none">
                <PlaygroundToggleButtons
                    toggles={toggles}
                    onChange={setToggles}
                    onPreset={() => void setConfig(PLAYGROUND_BUDGIE_CONFIG)}
                />
                {toggles.isPanelOpen ? <PlaygroundSliders config={config} scheme={scheme} onChange={setConfig} /> : null}
            </View>
        </ScreenChromeProvider>
    );
};
