import React from 'react';
import { View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeWebBand } from './edge-fade-web-band';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeBlurRadius } from './util/get-edge-fade-blur-radius/get-edge-fade-blur-radius.util';
import { getEdgeFadeChromePlateau } from './util/get-edge-fade-chrome-plateau/get-edge-fade-chrome-plateau.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';
import { getWebEdgeFadeBlurLayers } from './util/get-web-edge-fade-blur-layers/get-web-edge-fade-blur-layers.util';
import { getWebEdgeFadeVisualStyle } from './util/get-web-edge-fade-visual-style/get-web-edge-fade-visual-style.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);

/**
 * Renders a decorative web progressive backdrop blur and color wash at one screen edge.
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
    const animatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const metrics = getEdgeFadeBandMetrics(position, height, config, insets);
    const plateau = getEdgeFadeChromePlateau(metrics.height, insets[position], chromeHeight);
    const washStyle = getWebEdgeFadeVisualStyle(position, colorScheme, config, plateau);
    const blurLayers = getWebEdgeFadeBlurLayers(
        position,
        getEdgeFadeBlurRadius(intensity, scrollAnimation, config),
        metrics.height,
        plateau
    );
    const renderResolvedBand = renderBand ?? renderEdgeFadeBand;

    if (!isDefined(renderResolvedBand)) {
        return (
            <View {...viewProps} pointerEvents="none" aria-hidden style={[edgeFadeStyles.band, metrics, style]}>
                <EdgeFadeWebBand blurLayers={blurLayers} washStyle={washStyle} opacityStyle={animatedStyle} />
            </View>
        );
    }

    return (
        <AnimatedView
            {...viewProps}
            pointerEvents="none"
            aria-hidden
            style={[edgeFadeStyles.band, metrics, animatedStyle, style]}
        >
            {renderResolvedBand({
                position,
                colorScheme,
                height: metrics.height,
                ...getEdgeFadeVisuals(position, colorScheme, config, plateau),
                blur: (
                    <View style={edgeFadeStyles.fill}>
                        <EdgeFadeWebBand blurLayers={blurLayers} />
                    </View>
                ),
                defaultBand: (
                    <View style={edgeFadeStyles.fill}>
                        <EdgeFadeWebBand blurLayers={blurLayers} washStyle={washStyle} />
                    </View>
                ),
            })}
        </AnimatedView>
    );
};
