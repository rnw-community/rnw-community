import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import type { WebEdgeFadeStyleInterface } from './web-edge-fade-style.interface';
import type { ReactNode } from 'react';
import type { AnimatedStyle } from 'react-native-reanimated';

const AnimatedView = createAnimatedComponent(View);

interface Props {
    readonly blurLayers: readonly WebEdgeFadeStyleInterface[];
    readonly washStyle?: WebEdgeFadeStyleInterface;
    readonly opacityStyle?: AnimatedStyle<{ opacity?: number }>;
}

export const EdgeFadeWebBand = ({ blurLayers, washStyle, opacityStyle }: Props): ReactNode => (
    <>
        {blurLayers.map(layerStyle => (
            <AnimatedView key={layerStyle.backdropFilter} style={[StyleSheet.absoluteFill, layerStyle, opacityStyle]} />
        ))}
        {isDefined(washStyle) && <AnimatedView style={[StyleSheet.absoluteFill, washStyle, opacityStyle]} />}
    </>
);
