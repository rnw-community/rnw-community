import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefined, isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeBlurProps } from './hooks/use-edge-fade-blur-props.hook';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedBlurView = createAnimatedComponent(BlurView);

/**
 * Renders a decorative native blur band at one screen edge.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefade
 */
export const EdgeFade = ({
    position,
    height,
    intensity,
    scrollAnimation,
    blurMethod,
    blurTarget,
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const resolvedBlurMethod = getDefined(blurMethod, () => (isDefined(blurTarget) ? 'dimezisBlurView' : 'none'));
    const resolvedIntensity = getDefined(intensity, () => config.intensity);
    const { tint } = getEdgeFadeVisuals(position, colorScheme, config, Platform.OS === 'ios');
    const resolvedMaxIntensity = getDefined(scrollAnimation?.maxIntensity, () => config.maxBlurIntensity);
    const containerAnimatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const animatedBlurProps = useEdgeFadeBlurProps(
        scrollAnimation?.intensityInputRange,
        resolvedMaxIntensity,
        resolvedIntensity
    );
    const positionalStyle = getEdgeFadeBandMetrics(position, height, config, insets);

    return (
        <AnimatedBlurView
            {...viewProps}
            pointerEvents="none"
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[edgeFadeStyles.band, positionalStyle, containerAnimatedStyle, style]}
            tint={tint}
            blurMethod={resolvedBlurMethod}
            {...(isDefined(blurTarget) ? { blurTarget } : {})}
            {...(isDefined(scrollAnimation) ? { animatedProps: animatedBlurProps } : { intensity: resolvedIntensity })}
        />
    );
};
