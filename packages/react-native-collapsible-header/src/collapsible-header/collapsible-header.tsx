import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Extrapolation,
    createAnimatedComponent,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import { assertValidCollapsibleHeaderConfig } from '../utils/assert-valid-collapsible-header-config.util.js';
import { resolveCollapsibleHeaderMotionConfig } from '../utils/resolve-collapsible-header-motion-config.util.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { ViewProps } from 'react-native';

const styles = StyleSheet.create({
    background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    header: { position: 'relative' },
    content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
const AnimatedView = createAnimatedComponent(View);

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

interface CollapsibleHeaderAnimationConfig {
    readonly scrollY: CollapsibleHeaderProps['scrollY'];
    readonly expandedHeight: number;
    readonly collapsedHeight: number;
    readonly collapseStart: number;
    readonly collapseDistance: number;
    readonly motionConfig: CollapsibleHeaderMotionConfig;
}

const useCollapsibleHeaderAnimatedLayers = ({
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
                translateY: interpolate(
                    scrollY.get(),
                    [collapsedOpacityStart, collapseEnd],
                    [motionConfig.collapsedTranslateY, 0],
                    Extrapolation.CLAMP
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

/**
 * Renders caller-owned expanded and collapsed content inside an animated header shell.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheader
 */
export const CollapsibleHeader = (props: CollapsibleHeaderProps) => {
    const {
        expandedContent,
        collapsedContent,
        persistentContent,
        scrollY,
        expandedHeight,
        collapsedHeight,
        collapseDistance,
        collapseStart = 0,
        motion,
        headerStyle,
        backgroundStyle,
        expandedContentContainerStyle,
        collapsedContentContainerStyle,
        persistentContentContainerStyle,
        style,
        ...viewProps
    } = props;
    const motionConfig = resolveCollapsibleHeaderMotionConfig(motion);

    assertValidCollapsibleHeaderConfig({ expandedHeight, collapsedHeight, collapseDistance, collapseStart }, motionConfig);
    const {
        expandedAnimatedStyle,
        collapsedAnimatedStyle,
        backgroundAnimatedStyle,
        headerAnimatedStyle,
        expandedAnimatedProps,
        collapsedAnimatedProps,
    } = useCollapsibleHeaderAnimatedLayers({
        scrollY,
        expandedHeight,
        collapsedHeight,
        collapseStart,
        collapseDistance,
        motionConfig,
    });

    return (
        <View {...viewProps} style={style}>
            <AnimatedView pointerEvents="none" style={[styles.background, backgroundStyle, backgroundAnimatedStyle]} />
            <AnimatedView style={[styles.header, headerStyle, headerAnimatedStyle]}>
                <AnimatedView
                    animatedProps={collapsedAnimatedProps}
                    style={[styles.content, collapsedContentContainerStyle, collapsedAnimatedStyle]}
                >
                    {collapsedContent}
                </AnimatedView>
                <AnimatedView
                    animatedProps={expandedAnimatedProps}
                    style={[styles.content, expandedContentContainerStyle, expandedAnimatedStyle]}
                >
                    {expandedContent}
                </AnimatedView>
                {isDefined(persistentContent) && (
                    <View pointerEvents="box-none" style={[styles.content, persistentContentContainerStyle]}>
                        {persistentContent}
                    </View>
                )}
            </AnimatedView>
        </View>
    );
};
