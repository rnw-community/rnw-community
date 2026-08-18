import {
    Extrapolation,
    clamp,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
} from 'react-native-reanimated';

import type { CollapsibleHeaderAnimationConfig } from '../../interface/collapsible-header-animation-config.interface';
import type { ViewProps } from 'react-native';

const interpolateProgressFadeOut = (progressValue: number, fadeEndProgress: number): number => {
    'worklet';

    if (fadeEndProgress === 0) {
        return 0;
    }

    return interpolate(progressValue, [0, fadeEndProgress], [1, 0], Extrapolation.CLAMP);
};

const interpolateProgressFadeIn = (progressValue: number, fadeStartProgress: number): number => {
    'worklet';

    if (fadeStartProgress === 1) {
        return Number(progressValue >= 1);
    }

    return interpolate(progressValue, [fadeStartProgress, 1], [0, 1], Extrapolation.CLAMP);
};

const interpolateCollapsedProgressTranslateY = (
    progressValue: number,
    fadeStartProgress: number,
    collapsedTranslateY: number
): number => {
    'worklet';

    if (fadeStartProgress === 1) {
        return progressValue < 1 ? collapsedTranslateY : 0;
    }

    return interpolate(progressValue, [fadeStartProgress, 1], [collapsedTranslateY, 0], Extrapolation.CLAMP);
};

export const useCollapsibleHeaderAnimatedLayers = ({
    scrollY,
    expandedHeight,
    collapsedHeight,
    collapseStart,
    collapseDistance,
    motionConfig,
    stretchOnOverscroll,
}: CollapsibleHeaderAnimationConfig) => {
    const progress = useDerivedValue(() => clamp((scrollY.get() - collapseStart) / collapseDistance, 0, 1));
    const pointerEventsSwitchOffset = collapseStart + collapseDistance * motionConfig.pointerEventsSwitchProgress;
    const expandedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeOut(progress.get(), motionConfig.expandedOpacityEndProgress),
        pointerEvents: scrollY.get() <= pointerEventsSwitchOffset ? 'auto' : 'none',
        transform: [
            {
                translateY: interpolate(progress.get(), [0, 1], [0, motionConfig.expandedTranslateY], Extrapolation.CLAMP),
            },
            { scale: interpolate(progress.get(), [0, 1], [1, motionConfig.expandedScale], Extrapolation.CLAMP) },
        ],
    }));
    const collapsedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeIn(progress.get(), motionConfig.collapsedOpacityStartProgress),
        pointerEvents: scrollY.get() <= pointerEventsSwitchOffset ? 'none' : 'auto',
        transform: [
            {
                translateY: interpolateCollapsedProgressTranslateY(
                    progress.get(),
                    motionConfig.collapsedOpacityStartProgress,
                    motionConfig.collapsedTranslateY
                ),
            },
        ],
    }));
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeIn(progress.get(), motionConfig.backgroundOpacityStartProgress),
    }));
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        height:
            interpolate(progress.get(), [0, 1], [expandedHeight, collapsedHeight], Extrapolation.CLAMP) +
            (stretchOnOverscroll && scrollY.get() < 0 ? -scrollY.get() : 0),
    }));
    const expandedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        accessibilityElementsHidden: scrollY.get() > pointerEventsSwitchOffset,
        importantForAccessibility: scrollY.get() > pointerEventsSwitchOffset ? 'no-hide-descendants' : 'auto',
    }));
    const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        accessibilityElementsHidden: scrollY.get() <= pointerEventsSwitchOffset,
        importantForAccessibility: scrollY.get() <= pointerEventsSwitchOffset ? 'no-hide-descendants' : 'auto',
    }));

    return {
        progress,
        expandedAnimatedStyle,
        collapsedAnimatedStyle,
        backgroundAnimatedStyle,
        headerAnimatedStyle,
        expandedAnimatedProps,
        collapsedAnimatedProps,
    };
};
