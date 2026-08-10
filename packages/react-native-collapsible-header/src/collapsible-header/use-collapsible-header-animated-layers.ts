import { Extrapolation, interpolate, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';

import type { CollapsibleHeaderAnimationConfig } from '../interface/collapsible-header-animation-config.interface';
import type { ViewProps } from 'react-native';

const interpolateFadeOut = (value: number, start: number, end: number): number => {
    'worklet';

    if (start === end) {
        return Number(value < start);
    }

    return interpolate(value, [start, end], [1, 0], Extrapolation.CLAMP);
};

const interpolateFadeIn = (value: number, start: number, end: number): number => {
    'worklet';

    if (start === end) {
        return Number(value >= end);
    }

    return interpolate(value, [start, end], [0, 1], Extrapolation.CLAMP);
};

const interpolateCollapsedTranslateY = (value: number, start: number, end: number, collapsedTranslateY: number): number => {
    'worklet';

    if (start === end) {
        return value < start ? collapsedTranslateY : 0;
    }

    return interpolate(value, [start, end], [collapsedTranslateY, 0], Extrapolation.CLAMP);
};

export const useCollapsibleHeaderAnimatedLayers = ({
    scrollY,
    expandedHeight,
    collapsedHeight,
    collapseStart,
    collapseDistance,
    motionConfig,
}: CollapsibleHeaderAnimationConfig) => {
    const collapseEnd = collapseStart + collapseDistance;
    const expandedOpacityEnd = collapseStart + collapseDistance * motionConfig.expandedOpacityEndProgress;
    const collapsedOpacityStart = collapseStart + collapseDistance * motionConfig.collapsedOpacityStartProgress;
    const backgroundOpacityStart = collapseStart + collapseDistance * motionConfig.backgroundOpacityStartProgress;
    const pointerEventsSwitch = collapseStart + collapseDistance * motionConfig.pointerEventsSwitchProgress;
    const expandedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateFadeOut(scrollY.get(), collapseStart, expandedOpacityEnd),
        transform: [
            {
                translateY: interpolate(
                    scrollY.get(),
                    [collapseStart, collapseEnd],
                    [0, motionConfig.expandedTranslateY],
                    Extrapolation.CLAMP
                ),
            },
            {
                scale: interpolate(
                    scrollY.get(),
                    [collapseStart, collapseEnd],
                    [1, motionConfig.expandedScale],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));
    const collapsedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateFadeIn(scrollY.get(), collapsedOpacityStart, collapseEnd),
        transform: [
            {
                translateY: interpolateCollapsedTranslateY(
                    scrollY.get(),
                    collapsedOpacityStart,
                    collapseEnd,
                    motionConfig.collapsedTranslateY
                ),
            },
        ],
    }));
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolateFadeIn(scrollY.get(), backgroundOpacityStart, collapseEnd),
    }));
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        height: interpolate(
            scrollY.get(),
            [collapseStart, collapseEnd],
            [expandedHeight, collapsedHeight],
            Extrapolation.CLAMP
        ),
    }));
    const expandedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        pointerEvents: scrollY.get() <= pointerEventsSwitch ? 'auto' : 'none',
    }));
    const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        pointerEvents: scrollY.get() <= pointerEventsSwitch ? 'none' : 'auto',
    }));

    return {
        expandedAnimatedStyle,
        collapsedAnimatedStyle,
        backgroundAnimatedStyle,
        headerAnimatedStyle,
        expandedAnimatedProps,
        collapsedAnimatedProps,
    };
};
