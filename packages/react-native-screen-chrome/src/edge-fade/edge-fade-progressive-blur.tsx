import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';
import { ScreenChromeProgressiveBlurView } from './screen-chrome-progressive-blur-view';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);
const styles = StyleSheet.create({ fill: { flex: 1 } });

interface Props extends Pick<EdgeFadePropsInterface, 'position' | 'scrollAnimation'> {
    readonly radius: number;
    readonly plateau: number;
}

export const EdgeFadeProgressiveBlur = ({ position, radius, plateau, scrollAnimation }: Props): ReactNode => {
    const opacityStyle = useEdgeFadeOpacityStyle(scrollAnimation?.intensityInputRange);

    return (
        <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, opacityStyle]}>
            <ScreenChromeProgressiveBlurView style={styles.fill} position={position} radius={radius} plateau={plateau} />
        </AnimatedView>
    );
};
