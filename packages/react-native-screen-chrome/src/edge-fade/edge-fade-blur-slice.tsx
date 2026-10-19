import React from 'react';

import { isDefined } from '@rnw-community/shared';

import { useEdgeFadeBlurProps } from './hooks/use-edge-fade-blur-props.hook';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { BlurMethod, BlurTint, BlurView } from 'expo-blur';
import type { ComponentType, ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { AnimatedProps } from 'react-native-reanimated';

interface Props extends Pick<EdgeFadePropsInterface, 'blurTarget'> {
    readonly AnimatedBlurView: ComponentType<AnimatedProps<BlurView['props']>>;
    readonly style: ViewStyle;
    readonly tint: BlurTint;
    readonly blurMethod: BlurMethod;
    readonly intensity: number;
    readonly maxIntensity: number;
    readonly intensityInputRange: readonly [number, number] | undefined;
    readonly isAnimated: boolean;
}

export const EdgeFadeBlurSlice = ({
    AnimatedBlurView,
    style,
    tint,
    blurMethod,
    blurTarget,
    intensity,
    maxIntensity,
    intensityInputRange,
    isAnimated,
}: Props): ReactNode => {
    const animatedBlurProps = useEdgeFadeBlurProps(intensityInputRange, maxIntensity, intensity);

    return (
        <AnimatedBlurView
            style={style}
            tint={tint}
            blurMethod={blurMethod}
            {...(isDefined(blurTarget) ? { blurTarget } : {})}
            {...(isAnimated ? { animatedProps: animatedBlurProps } : { intensity })}
        />
    );
};
