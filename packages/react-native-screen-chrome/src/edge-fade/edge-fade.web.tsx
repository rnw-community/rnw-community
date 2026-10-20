import React from 'react';
import { View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefined, isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeWebBand } from './edge-fade-web-band';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';
import { getWebEdgeFadeBlurLayers } from './util/get-web-edge-fade-blur-layers/get-web-edge-fade-blur-layers.util';
import { getWebEdgeFadeVisualStyle } from './util/get-web-edge-fade-visual-style/get-web-edge-fade-visual-style.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);

/**
 * Renders a decorative web edge-stepped backdrop blur and color wash at one screen edge.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#edgefade
 */
export const EdgeFade = ({
    position,
    height,
    intensity,
    scrollAnimation,
    blurMethod: _blurMethod,
    blurTarget: _blurTarget,
    renderBand,
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme, renderEdgeFadeBand } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const animatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const metrics = getEdgeFadeBandMetrics(position, height, config, insets);
    const washStyle = getWebEdgeFadeVisualStyle(position, colorScheme, config);
    const blurLayers = getWebEdgeFadeBlurLayers(
        position,
        config,
        getDefined(intensity, () => config.intensity)
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
                ...getEdgeFadeVisuals(position, colorScheme, config, false),
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
