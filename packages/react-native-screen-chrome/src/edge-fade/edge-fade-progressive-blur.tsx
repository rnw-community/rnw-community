import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { useEdgeFadeOpacityStyle } from './hooks/use-edge-fade-opacity-style.hook';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { ScreenChromeColorScheme } from '../type/screen-chrome-color-scheme.type';
import type { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import type { ReactNode } from 'react';

const AnimatedView = createAnimatedComponent(View);
const BLUR_DIRECTION = { top: 'blurredTopClearBottom', bottom: 'blurredBottomClearTop' } as const;

interface Props extends Pick<EdgeFadePropsInterface, 'position' | 'scrollAnimation'> {
    readonly ProgressiveBlur: typeof ProgressiveBlurView;
    readonly colorScheme: ScreenChromeColorScheme;
    readonly radius: number;
}

export const EdgeFadeProgressiveBlur = ({
    ProgressiveBlur,
    position,
    colorScheme,
    radius,
    scrollAnimation,
}: Props): ReactNode => {
    const opacityStyle = useEdgeFadeOpacityStyle(scrollAnimation?.intensityInputRange);

    return (
        <AnimatedView pointerEvents="none" style={[StyleSheet.absoluteFill, opacityStyle]}>
            <ProgressiveBlur
                style={StyleSheet.absoluteFill}
                blurType={colorScheme}
                blurAmount={radius}
                direction={BLUR_DIRECTION[position]}
                startOffset={0}
            />
        </AnimatedView>
    );
};
