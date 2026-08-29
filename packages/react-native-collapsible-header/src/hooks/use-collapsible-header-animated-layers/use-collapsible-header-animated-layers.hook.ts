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

const getLayerAccessibilityProps = (isExposed: boolean): ViewProps => {
    'worklet';

    return {
        accessibilityElementsHidden: !isExposed,
        importantForAccessibility: isExposed ? 'auto' : 'no-hide-descendants',
    };
};

const isExpandedLayerVisible = (progressValue: number, fadeEndProgress: number): boolean => {
    'worklet';

    return fadeEndProgress > 0 && progressValue < fadeEndProgress;
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
    // The expanded layer only owns hit testing and accessibility focus while it is still painted. A motion
    // config whose fades do not overlap (equal or inverted thresholds) puts the derived switch exactly where
    // the expanded layer reaches zero opacity, and without this guard the invisible layer would keep both.
    const expandedOwnsInteraction = useDerivedValue(
        () =>
            scrollY.get() <= pointerEventsSwitchOffset &&
            isExpandedLayerVisible(progress.get(), motionConfig.expandedOpacityEndProgress)
    );
    const expandedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeOut(progress.get(), motionConfig.expandedOpacityEndProgress),
        pointerEvents: expandedOwnsInteraction.get() ? 'box-none' : 'none',
        transform: [
            { translateY: interpolate(progress.get(), [0, 1], [0, motionConfig.expandedTranslateY], Extrapolation.CLAMP) },
            { scale: interpolate(progress.get(), [0, 1], [1, motionConfig.expandedScale], Extrapolation.CLAMP) },
        ],
    }));
    const collapsedTranslateY = (): number => {
        'worklet';

        return interpolateCollapsedProgressTranslateY(
            progress.get(),
            motionConfig.collapsedOpacityStartProgress,
            motionConfig.collapsedTranslateY
        );
    };
    const collapsedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeIn(progress.get(), motionConfig.collapsedOpacityStartProgress),
        pointerEvents: expandedOwnsInteraction.get() ? 'none' : 'box-none',
        transform: [{ translateY: collapsedTranslateY() }],
    }));
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgressFadeIn(progress.get(), motionConfig.backgroundOpacityStartProgress),
    }));
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        height:
            interpolate(progress.get(), [0, 1], [expandedHeight, collapsedHeight], Extrapolation.CLAMP) +
            (stretchOnOverscroll && scrollY.get() < 0 ? -scrollY.get() : 0),
    }));
    const expandedAnimatedProps = useAnimatedProps<ViewProps>(() =>
        getLayerAccessibilityProps(expandedOwnsInteraction.get())
    );
    const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() =>
        getLayerAccessibilityProps(!expandedOwnsInteraction.get())
    );

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
