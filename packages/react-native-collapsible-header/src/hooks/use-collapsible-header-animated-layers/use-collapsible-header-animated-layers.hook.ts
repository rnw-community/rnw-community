import {
    Extrapolation,
    clamp,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useDerivedValue,
} from 'react-native-reanimated';

import { getCollapsibleHeaderLayerAccessibilityProps } from '../../util/get-collapsible-header-layer-accessibility-props/get-collapsible-header-layer-accessibility-props';

import type { CollapsibleHeaderAnimationConfig } from '../../interface/collapsible-header-animation-config.interface';
import type { ViewProps } from 'react-native';

type ProgressRange = readonly [number, number];

const interpolateProgress = (progressValue: number, [start, end]: ProgressRange, [from, to]: ProgressRange): number => {
    'worklet';

    if (start === end) {
        return progressValue >= end ? to : from;
    }

    return interpolate(progressValue, [start, end], [from, to], Extrapolation.CLAMP);
};

const isExpandedLayerVisible = (progressValue: number, fadeEndProgress: number): boolean => {
    'worklet';

    return fadeEndProgress > 0 && progressValue < fadeEndProgress;
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
    const expandedOwnsInteraction = useDerivedValue(
        () =>
            scrollY.get() <= pointerEventsSwitchOffset &&
            isExpandedLayerVisible(progress.get(), motionConfig.expandedOpacityEndProgress)
    );
    const expandedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgress(progress.get(), [0, motionConfig.expandedOpacityEndProgress], [1, 0]),
        pointerEvents: expandedOwnsInteraction.get() ? 'box-none' : 'none',
        transform: [
            { translateY: interpolateProgress(progress.get(), [0, 1], [0, motionConfig.expandedTranslateY]) },
            { scale: interpolateProgress(progress.get(), [0, 1], [1, motionConfig.expandedScale]) },
        ],
    }));
    const collapsedFadeRange: ProgressRange = [motionConfig.collapsedOpacityStartProgress, 1];
    const collapsedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgress(progress.get(), collapsedFadeRange, [0, 1]),
        pointerEvents: expandedOwnsInteraction.get() ? 'none' : 'box-none',
        transform: [
            { translateY: interpolateProgress(progress.get(), collapsedFadeRange, [motionConfig.collapsedTranslateY, 0]) },
        ],
    }));
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateProgress(progress.get(), [motionConfig.backgroundOpacityStartProgress, 1], [0, 1]),
    }));
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        height:
            interpolateProgress(progress.get(), [0, 1], [expandedHeight, collapsedHeight]) +
            (stretchOnOverscroll && scrollY.get() < 0 ? -scrollY.get() : 0),
    }));
    const expandedAnimatedProps = useAnimatedProps<ViewProps>(() =>
        getCollapsibleHeaderLayerAccessibilityProps(expandedOwnsInteraction.get())
    );
    const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() =>
        getCollapsibleHeaderLayerAccessibilityProps(!expandedOwnsInteraction.get())
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
