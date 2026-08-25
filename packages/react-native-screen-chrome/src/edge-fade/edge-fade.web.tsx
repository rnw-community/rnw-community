import React from 'react';
import { View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { buildBackgroundImage } from './util/build-background-image/build-background-image.util';
import { getEdgeFadeBackdropFilter } from './util/edge-fade-get-backdrop-filter/edge-fade-get-backdrop-filter.util';
import { getEdgeFadeBandMetrics } from './util/edge-fade-get-band-metrics/edge-fade-get-band-metrics.util';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { WebEdgeFadeStyleInterface } from './web-edge-fade-style.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);
const PERCENT_MULTIPLIER = 100;

const buildMaskImage = (maskStops: Readonly<Record<number, { readonly color: string }>>): string => {
    const stopsCss = Object.entries(maskStops)
        .sort(([firstOffset], [secondOffset]) => Number(firstOffset) - Number(secondOffset))
        .map(([offset, { color }]) => `${color} ${Number(offset) * PERCENT_MULTIPLIER}%`)
        .join(', ');

    return `linear-gradient(to bottom, ${stopsCss})`;
};

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
    style,
    ...viewProps
}: EdgeFadePropsInterface): ReactNode => {
    const { config, colorScheme } = useScreenChrome();
    const insets = useSafeAreaInsets();
    const resolvedIntensity = getDefined(intensity, () => config.intensity);
    const colorSet = config.colors[colorScheme];
    const backdropFilter = getEdgeFadeBackdropFilter(resolvedIntensity);
    const animatedStyle = useEdgeFadeOpacityStyle(scrollAnimation?.opacityInputRange);
    const positionalMetrics = getEdgeFadeBandMetrics(position, height, config, insets);
    const maskImage = buildMaskImage(config.maskStops[position]);
    const webStyle: WebEdgeFadeStyleInterface = {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 2,
        height: positionalMetrics.height,
        top: positionalMetrics.top,
        bottom: positionalMetrics.bottom,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        maskImage,
        WebkitMaskImage: maskImage,
        backgroundImage: buildBackgroundImage(colorSet, position),
    };

    return <AnimatedView {...viewProps} pointerEvents="none" aria-hidden style={[webStyle, animatedStyle, style]} />;
};
