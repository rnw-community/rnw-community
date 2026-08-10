import MaskedViewModule from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hook/use-screen-chrome.hook';

import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeBlurProps } from './hook/use-edge-fade-blur-props.hook';
import { useEdgeFadeOpacityStyle } from './hook/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './utils/edge-fade-get-band-metrics.util';
import { getEdgeFadeVisuals } from './utils/get-edge-fade-visuals/get-edge-fade-visuals.util';

import type { EdgeFadePropsInterface } from '../interface/edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);
const AnimatedBlurView = createAnimatedComponent(BlurView);
const MaskedView = MaskedViewModule;
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

/**
 * Renders a decorative native blur and color wash at one screen edge.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefade
 */
export const EdgeFade = ({
    position,
    height,
    intensity,
    scrollAnimation,
    blurMethod = 'dimezisBlurView',
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const resolvedIntensity = isDefined(intensity) ? intensity : config.intensity;
    const { washColors, maskColors, maskLocations, tint } = getEdgeFadeVisuals(
        position,
        colorScheme,
        config,
        Platform.OS === 'ios'
    );
    const opacityInputRange = scrollAnimation?.opacityInputRange;
    const intensityInputRange = scrollAnimation?.intensityInputRange;
    const scrollMaxIntensity = scrollAnimation?.maxIntensity;
    const resolvedMaxIntensity = isDefined(scrollMaxIntensity) ? scrollMaxIntensity : config.maxBlurIntensity;
    const containerAnimatedStyle = useEdgeFadeOpacityStyle(opacityInputRange);
    const animatedBlurProps = useEdgeFadeBlurProps(intensityInputRange, resolvedMaxIntensity, resolvedIntensity);
    const positionalStyle = getEdgeFadeBandMetrics(position, height, config, insets);

    return (
        <AnimatedView
            {...viewProps}
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[edgeFadeStyles.band, positionalStyle, containerAnimatedStyle, style]}
        >
            <MaskedView
                style={edgeFadeStyles.fill}
                maskElement={
                    <LinearGradient
                        colors={maskColors}
                        locations={maskLocations}
                        start={GRADIENT_START}
                        end={GRADIENT_END}
                        style={edgeFadeStyles.fill}
                    />
                }
            >
                <LinearGradient colors={washColors} start={GRADIENT_START} end={GRADIENT_END} style={edgeFadeStyles.fill} />
                <AnimatedBlurView
                    style={StyleSheet.absoluteFill}
                    tint={tint}
                    blurMethod={blurMethod}
                    {...(isDefined(scrollAnimation)
                        ? { animatedProps: animatedBlurProps }
                        : { intensity: resolvedIntensity })}
                />
            </MaskedView>
        </AnimatedView>
    );
};
