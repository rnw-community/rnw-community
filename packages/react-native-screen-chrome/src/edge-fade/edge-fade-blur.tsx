import React from 'react';
import { createAnimatedComponent } from 'react-native-reanimated';

import { getDefined, isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../hooks/use-screen-chrome/use-screen-chrome.hook';

import { edgeFadeNativeModules } from './edge-fade-native-modules';
import { edgeFadeStyles } from './edge-fade.styles';
import { useEdgeFadeBlurProps } from './hooks/use-edge-fade-blur-props.hook';
import { useIgnoredAndroidBlurWarning } from './hooks/use-ignored-android-blur-warning.hook';

import type { EdgeFadePropsInterface } from './edge-fade-props.interface';
import type { BlurTint } from 'expo-blur';
import type { ReactNode } from 'react';

const AnimatedBlurView = isDefined(edgeFadeNativeModules.BlurView)
    ? createAnimatedComponent(edgeFadeNativeModules.BlurView)
    : void 0;

interface Props extends Pick<EdgeFadePropsInterface, 'intensity' | 'scrollAnimation' | 'blurMethod' | 'blurTarget'> {
    readonly tint: BlurTint;
}

export const EdgeFadeBlur = ({ tint, intensity, scrollAnimation, blurMethod, blurTarget }: Props): ReactNode => {
    const { config } = useScreenChrome();

    useIgnoredAndroidBlurWarning({ blurMethod, blurTarget, intensity, scrollAnimation });

    const resolvedBlurMethod = getDefined(blurMethod, () => (isDefined(blurTarget) ? 'dimezisBlurView' : 'none'));
    const resolvedIntensity = getDefined(intensity, () => config.intensity);
    const resolvedMaxIntensity = getDefined(scrollAnimation?.maxIntensity, () => config.maxBlurIntensity);
    const animatedBlurProps = useEdgeFadeBlurProps(
        scrollAnimation?.intensityInputRange,
        resolvedMaxIntensity,
        resolvedIntensity
    );

    if (!isDefined(AnimatedBlurView)) {
        return null;
    }

    return (
        <AnimatedBlurView
            style={edgeFadeStyles.fill}
            tint={tint}
            blurMethod={resolvedBlurMethod}
            {...(isDefined(blurTarget) ? { blurTarget } : {})}
            {...(isDefined(scrollAnimation) ? { animatedProps: animatedBlurProps } : { intensity: resolvedIntensity })}
        />
    );
};
