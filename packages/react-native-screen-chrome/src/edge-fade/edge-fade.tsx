import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeBlur } from './edge-fade-blur';
import { edgeFadeNativeModules } from './edge-fade-native-modules';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { buildBackgroundImage } from './util/build-background-image/build-background-image.util';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeChromePlateau } from './util/get-edge-fade-chrome-plateau/get-edge-fade-chrome-plateau.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const { LinearGradient, MaskedView } = edgeFadeNativeModules;
const AnimatedView = createAnimatedComponent(View);
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

/**
 * Renders a decorative native blur and color wash band at one screen edge, faded out through a gradient mask.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefade
 */
export const EdgeFade = ({
    position,
    height,
    chromeHeight = 0,
    intensity,
    scrollAnimation,
    blurMethod,
    blurTarget,
    renderBand,
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme, renderEdgeFadeBand } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const visuals = getEdgeFadeVisuals(position, colorScheme, config, Platform.OS === 'ios');
    const containerAnimatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const positionalStyle = getEdgeFadeBandMetrics(position, height, config, insets);
    const renderResolvedBand = renderBand ?? renderEdgeFadeBand;
    const fallbackWashImage = buildBackgroundImage(config.colors[colorScheme], position);
    const blur = (
        <EdgeFadeBlur
            position={position}
            tint={visuals.tint}
            intensity={intensity}
            scrollAnimation={scrollAnimation}
            blurMethod={blurMethod}
            blurTarget={blurTarget}
            plateau={getEdgeFadeChromePlateau(positionalStyle.height, insets[position], chromeHeight)}
        />
    );
    const wash =
        isDefined(MaskedView) && isDefined(LinearGradient) ? (
            <MaskedView
                style={StyleSheet.absoluteFill}
                maskElement={
                    <LinearGradient
                        colors={visuals.maskColors}
                        locations={visuals.maskLocations}
                        start={GRADIENT_START}
                        end={GRADIENT_END}
                        style={edgeFadeStyles.fill}
                    />
                }
            >
                <LinearGradient
                    colors={visuals.washColors}
                    start={GRADIENT_START}
                    end={GRADIENT_END}
                    style={StyleSheet.absoluteFill}
                />
            </MaskedView>
        ) : (
            <View style={[StyleSheet.absoluteFill, { experimental_backgroundImage: fallbackWashImage }]} />
        );
    const defaultBand = (
        <View style={edgeFadeStyles.fill}>
            {blur}
            {wash}
        </View>
    );

    return (
        <AnimatedView
            {...viewProps}
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[edgeFadeStyles.band, positionalStyle, containerAnimatedStyle, style]}
        >
            {isDefined(renderResolvedBand)
                ? renderResolvedBand({
                      position,
                      colorScheme,
                      height: positionalStyle.height,
                      ...visuals,
                      blur,
                      defaultBand,
                  })
                : defaultBand}
        </AnimatedView>
    );
};
