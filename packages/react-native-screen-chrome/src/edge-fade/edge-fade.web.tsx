import React from 'react';
import { View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefined, isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';
import { getEdgeFadeVisuals } from './util/get-edge-fade-visuals/get-edge-fade-visuals.util';
import { getWebEdgeFadeVisualStyle } from './util/get-web-edge-fade-visual-style/get-web-edge-fade-visual-style.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { WebEdgeFadeStyleInterface } from './web-edge-fade-style.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);

/**
 * Renders a decorative web backdrop blur and color wash at one screen edge.
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
    const visualStyle = getWebEdgeFadeVisualStyle(
        position,
        colorScheme,
        config,
        getDefined(intensity, () => config.intensity)
    );
    const positionalStyle: WebEdgeFadeStyleInterface = {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 2,
        height: metrics.height,
        top: metrics.top,
        bottom: metrics.bottom,
    };
    const renderResolvedBand = renderBand ?? renderEdgeFadeBand;

    if (!isDefined(renderResolvedBand)) {
        return (
            <AnimatedView
                {...viewProps}
                pointerEvents="none"
                aria-hidden
                style={[{ ...positionalStyle, ...visualStyle }, animatedStyle, style]}
            />
        );
    }

    const blurStyle: WebEdgeFadeStyleInterface = {
        backdropFilter: visualStyle.backdropFilter,
        WebkitBackdropFilter: visualStyle.WebkitBackdropFilter,
    };

    return (
        <AnimatedView {...viewProps} pointerEvents="none" aria-hidden style={[positionalStyle, animatedStyle, style]}>
            {renderResolvedBand({
                position,
                colorScheme,
                height: metrics.height,
                ...getEdgeFadeVisuals(position, colorScheme, config, false),
                blur: <View style={[edgeFadeStyles.fill, blurStyle]} />,
                defaultBand: <View style={[edgeFadeStyles.fill, visualStyle]} />,
            })}
        </AnimatedView>
    );
};
