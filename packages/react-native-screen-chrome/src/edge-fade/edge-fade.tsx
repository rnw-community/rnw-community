import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeBlur } from './edge-fade-blur';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

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
    const blur = (
        <EdgeFadeBlur
            tint={visuals.tint}
            intensity={intensity}
            scrollAnimation={scrollAnimation}
            blurMethod={blurMethod}
            blurTarget={blurTarget}
        />
    );
    const defaultBand = (
        <MaskedView
            style={edgeFadeStyles.fill}
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
            {blur}
            <LinearGradient
                colors={visuals.washColors}
                start={GRADIENT_START}
                end={GRADIENT_END}
                style={StyleSheet.absoluteFill}
            />
        </MaskedView>
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
