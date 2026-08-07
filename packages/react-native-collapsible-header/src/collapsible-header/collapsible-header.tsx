import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Extrapolation,
    createAnimatedComponent,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
} from 'react-native-reanimated';

import { isPositiveNumber } from '@rnw-community/shared';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { ViewProps } from 'react-native';

const BACKGROUND_FADE_START = 0.7;
const COLLAPSED_SCALE = 0.9;

const styles = StyleSheet.create({
    background: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
    header: { position: 'relative' },
    content: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
});
const AnimatedView = createAnimatedComponent(View);

const assertValidGeometry = (expandedHeight: number, collapsedHeight: number, collapseDistance: number) => {
    if (!isPositiveNumber(expandedHeight)) {
        throw new Error('expandedHeight must be greater than zero');
    }
    if (!isPositiveNumber(collapsedHeight)) {
        throw new Error('collapsedHeight must be greater than zero');
    }
    if (!isPositiveNumber(collapseDistance)) {
        throw new Error('collapseDistance must be greater than zero');
    }
    if (expandedHeight < collapsedHeight) {
        throw new Error('expandedHeight must be greater than or equal to collapsedHeight');
    }
};

/**
 * Renders caller-owned expanded and collapsed content inside an animated header shell.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-collapsible-header#collapsibleheader
 */
export const CollapsibleHeader = (props: CollapsibleHeaderProps) => {
    const {
        expandedContent,
        collapsedContent,
        scrollY,
        expandedHeight,
        collapsedHeight,
        collapseDistance,
        headerStyle,
        backgroundStyle,
        expandedContentContainerStyle,
        collapsedContentContainerStyle,
        style,
        ...viewProps
    } = props;

    assertValidGeometry(expandedHeight, collapsedHeight, collapseDistance);

    const expandedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.get(), [0, collapseDistance * 0.6], [1, 0], Extrapolation.CLAMP),
        transform: [
            { translateY: interpolate(scrollY.get(), [0, collapseDistance], [0, -20], Extrapolation.CLAMP) },
            { scale: interpolate(scrollY.get(), [0, collapseDistance], [1, COLLAPSED_SCALE], Extrapolation.CLAMP) },
        ],
    }));
    const collapsedAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.get(), [collapseDistance * 0.5, collapseDistance], [0, 1], Extrapolation.CLAMP),
        transform: [
            {
                translateY: interpolate(
                    scrollY.get(),
                    [collapseDistance * 0.5, collapseDistance],
                    [10, 0],
                    Extrapolation.CLAMP
                ),
            },
        ],
    }));
    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(
            scrollY.get(),
            [collapseDistance * BACKGROUND_FADE_START, collapseDistance],
            [0, 1],
            Extrapolation.CLAMP
        ),
    }));
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        height: interpolate(scrollY.get(), [0, collapseDistance], [expandedHeight, collapsedHeight], Extrapolation.CLAMP),
    }));
    const expandedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        pointerEvents: scrollY.get() < collapseDistance * 0.5 ? 'auto' : 'none',
    }));
    const collapsedAnimatedProps = useAnimatedProps<ViewProps>(() => ({
        pointerEvents: scrollY.get() < collapseDistance * 0.5 ? 'none' : 'auto',
    }));

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
            </AnimatedView>
        </View>
    );
};
