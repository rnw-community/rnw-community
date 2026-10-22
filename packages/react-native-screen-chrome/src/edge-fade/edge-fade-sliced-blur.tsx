import React from 'react';
import { View } from 'react-native';
import { createAnimatedComponent } from 'react-native-reanimated';

import { getDefined, isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { EdgeFadeBlurSlice } from './edge-fade-blur-slice';
import { edgeFadeNativeModules } from './edge-fade-native-modules';
import { edgeFadeStyles } from './edge-fade.styles';
import { useIgnoredAndroidBlurWarning } from './hooks/use-ignored-android-blur-warning.hook';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { BlurTint } from 'expo-blur';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

const AnimatedBlurView = isDefined(edgeFadeNativeModules.BlurView)
    ? createAnimatedComponent(edgeFadeNativeModules.BlurView)
    : void 0;
const BLUR_SLICE_COUNT = 4;
const BLUR_SLICE_PERCENT = 100 / BLUR_SLICE_COUNT;
const BLUR_SLICE_STEPS_FROM_EDGE = Array.from({ length: BLUR_SLICE_COUNT }, (_, step) => step);

interface Props extends Pick<
    EdgeFadePropsInterface,
    'position' | 'intensity' | 'scrollAnimation' | 'blurMethod' | 'blurTarget'
> {
    readonly tint: BlurTint;
}

const getSliceStyle = (position: EdgeFadePropsInterface['position'], stepFromEdge: number): ViewStyle => ({
    position: 'absolute',
    left: 0,
    right: 0,
    height: `${BLUR_SLICE_PERCENT}%`,
    [position]: `${stepFromEdge * BLUR_SLICE_PERCENT}%`,
});

export const EdgeFadeSlicedBlur = ({
    position,
    tint,
    intensity,
    scrollAnimation,
    blurMethod,
    blurTarget,
}: Props): ReactNode => {
    const { config } = useScreenChrome();

    useIgnoredAndroidBlurWarning({ blurMethod, blurTarget, intensity, scrollAnimation });

    if (!isDefined(AnimatedBlurView)) {
        return null;
    }

    const resolvedBlurMethod = getDefined(blurMethod, () => (isDefined(blurTarget) ? 'dimezisBlurView' : 'none'));
    const resolvedIntensity = getDefined(intensity, () => config.intensity);
    const resolvedMaxIntensity = getDefined(scrollAnimation?.maxIntensity, () => config.maxBlurIntensity);

    return (
        <View pointerEvents="none" style={edgeFadeStyles.fill}>
            {BLUR_SLICE_STEPS_FROM_EDGE.map(stepFromEdge => (
                <EdgeFadeBlurSlice
                    key={stepFromEdge}
                    AnimatedBlurView={AnimatedBlurView}
                    style={getSliceStyle(position, stepFromEdge)}
                    tint={tint}
                    blurMethod={resolvedBlurMethod}
                    blurTarget={blurTarget}
                    intensity={resolvedIntensity / 2 ** stepFromEdge}
                    maxIntensity={resolvedMaxIntensity / 2 ** stepFromEdge}
                    intensityInputRange={scrollAnimation?.intensityInputRange}
                    isAnimated={isDefined(scrollAnimation)}
                />
            ))}
        </View>
    );
};
