import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { ScreenChromeProgressiveBlurView } from './screen-chrome-progressive-blur-view';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);

interface Props extends Pick<EdgeFadePropsInterface, 'position' | 'scrollAnimation'> {
    readonly colorScheme: ScreenChromeColorScheme;
    readonly radius: number;
    readonly plateau: number;
}

export const EdgeFadeProgressiveBlur = ({ position, colorScheme, radius, plateau, scrollAnimation }: Props): ReactNode => {
    const opacityStyle = useEdgeFadeOpacityStyle(scrollAnimation?.intensityInputRange);

    return (
        <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, opacityStyle]}>
            <ScreenChromeProgressiveBlurView
                style={StyleSheet.absoluteFill}
                position={position}
                radius={radius}
                plateau={plateau}
                colorScheme={colorScheme}
            />
        </AnimatedView>
    );
};
