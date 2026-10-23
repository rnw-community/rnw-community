import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeProgressiveBlur } from './edge-fade-progressive-blur';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { buildNativeWashImage } from './util/build-native-wash-image/build-native-wash-image.util';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeBlurRadius } from './util/get-edge-fade-blur-radius/get-edge-fade-blur-radius.util';
import { getEdgeFadeChromePlateau } from './util/get-edge-fade-chrome-plateau/get-edge-fade-chrome-plateau.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);

/**
 * Renders a decorative native progressive blur and color wash band at one screen edge.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefade
 */
export const EdgeFade = ({
    position,
    height,
    chromeHeight = 0,
    intensity,
    scrollAnimation,
    renderBand,
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme, renderEdgeFadeBand } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const containerAnimatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const positionalStyle = getEdgeFadeBandMetrics(position, height, config, insets);
    const plateau = getEdgeFadeChromePlateau(positionalStyle.height, insets[position], chromeHeight);
    const visuals = getEdgeFadeVisuals(position, colorScheme, config, plateau);
    const renderResolvedBand = renderBand ?? renderEdgeFadeBand;
    const washImage = buildNativeWashImage(visuals.washColors, visuals.maskColors, visuals.maskLocations);
    const blur = (
        <EdgeFadeProgressiveBlur
            position={position}
            radius={getEdgeFadeBlurRadius(intensity, scrollAnimation, config)}
            plateau={plateau}
            scrollAnimation={scrollAnimation}
        />
    );
    const defaultBand = (
        <View style={edgeFadeStyles.fill}>
            {blur}
            <View style={[StyleSheet.absoluteFill, { experimental_backgroundImage: washImage }]} />
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
