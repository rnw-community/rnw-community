import MaskedViewModule from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';
import { useScreenChrome } from '../hook/use-screen-chrome.hook.js';

import { edgeFadeStyles } from './edge-fade.styles.js';
import { useEdgeFadeBlurProps } from './hook/use-edge-fade-blur-props.hook.js';
import { useEdgeFadeOpacityStyle } from './hook/use-edge-fade-opacity-style.hook.js';
import { getEdgeFadeBandMetrics } from './utils/edge-fade-get-band-metrics.util.js';
import { getEdgeFadeMaskStops } from './utils/edge-fade-get-mask-stops.util.js';
import { getBlurTint } from './utils/get-blur-tint.util.js';

import type { EdgeFadePropsInterface } from '../interface/edge-fade-props.interface.js';
import type { ScreenChromeConfigInterface } from '../interface/screen-chrome-config.interface.js';
import type { EdgeFadePosition } from '../type/edge-fade-position.type.js';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);
const AnimatedBlurView = createAnimatedComponent(BlurView);
const MaskedView = MaskedViewModule;
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 0, y: 1 };

const toGradientTuple = <T,>(items: readonly T[]): readonly [T, T, ...T[]] => {
    const [first, second, ...remaining] = items;

    if (!isDefined(first) || !isDefined(second)) {
        throw new TypeError('EdgeFade gradients require at least two stops');
    }

    return [first, second, ...remaining];
};

const getEdgeFadeVisuals = (
    position: EdgeFadePosition,
    colorScheme: ColorSchemeEnum,
    config: ScreenChromeConfigInterface
) => {
    const colorSet = config.colors[colorScheme];
    const washColors =
        position === 'top'
            ? toGradientTuple([colorSet.solid, colorSet.wash])
            : toGradientTuple([colorSet.wash, colorSet.solid]);

    return {
        washColors,
        maskGradient: getEdgeFadeMaskStops(config.maskStops, position),
        tint: getBlurTint(colorScheme, Platform.OS === 'ios'),
    };
};

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
    const { washColors, maskGradient, tint } = getEdgeFadeVisuals(position, colorScheme, config);
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
                        colors={toGradientTuple(maskGradient.colors)}
                        locations={toGradientTuple(maskGradient.locations)}
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
