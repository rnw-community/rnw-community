import { expect } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const BACKGROUND_LAYER = 1;
const HEADER_LAYER = 2;
const EXPANDED_LAYER = 3;
const COLLAPSED_LAYER = 4;
const PERSISTENT_LAYER = 5;
const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const CUSTOM_COLLAPSE_START = 20;
const CUSTOM_COLLAPSE_DISTANCE = 80;
const CUSTOM_INTERMEDIATE_SCROLL_OFFSET = 60;
const CUSTOM_INTERMEDIATE_HEIGHT = 98;
const OUTER_PADDING = 24;
const INVALID_EXPANDED_HEIGHT = 39;
const NEGATIVE_SCROLL_OFFSET = -20;
const BEYOND_COLLAPSE_SCROLL_OFFSET = 140;
const COLLAPSED_SCALE = 0.9;
const INTERMEDIATE_SCROLL_OFFSET = 75;
const INTERMEDIATE_HEIGHT = 69;
const INTERMEDIATE_BACKGROUND_OPACITY = 1 / 6;
const INTERMEDIATE_SCALE = 0.925;
const CUSTOM_MOTION: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.75,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.25,
    pointerEventsSwitchProgress: 0.6,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedTranslateY: 0,
};

interface SubjectProps extends Partial<
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart' | 'motion'>
> {
    readonly scrollOffset?: number;
    readonly withPersistentContent?: boolean;
}

interface LayerProps {
    readonly style: StyleProp<ViewStyle>;
    readonly pointerEvents?: ViewProps['pointerEvents'];
}

interface AnimationExpectation {
    readonly name: string;
    readonly scrollOffset: number;
    readonly height: number;
    readonly backgroundOpacity: number;
    readonly expandedOpacity: number;
    readonly expandedTranslateY: number;
    readonly expandedScale: number;
    readonly collapsedOpacity: number;
    readonly collapsedTranslateY: number;
}

interface MotionConfigExpectation {
    readonly name: string;
    readonly motion: Partial<CollapsibleHeaderMotionConfig>;
    readonly message: string;
}

interface CustomMotionExpectation {
    readonly name: string;
    readonly scrollOffset: number;
    readonly height: number;
    readonly backgroundOpacity: number;
    readonly expandedOpacity: number;
    readonly collapsedOpacity: number;
}

const Subject = ({
    scrollOffset = 0,
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
    collapseStart,
    motion,
    withPersistentContent = false,
}: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);
    const persistentContent = withPersistentContent ? <Text testID="persistent-content">Persistent</Text> : null;

    return (
        <CollapsibleHeader
            accessibilityLabel="Account summary"
            testID="collapsible-header"
            style={{ paddingTop: OUTER_PADDING }}
            scrollY={scrollY}
            expandedHeight={expandedHeight}
            collapsedHeight={collapsedHeight}
            collapseDistance={collapseDistance}
            collapseStart={collapseStart}
            motion={motion}
            expandedContent={<Text testID="expanded-content">Expanded</Text>}
            collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
            persistentContent={persistentContent}
            backgroundStyle={{ zIndex: BACKGROUND_LAYER }}
            headerStyle={{ zIndex: HEADER_LAYER }}
            expandedContentContainerStyle={{ zIndex: EXPANDED_LAYER }}
            collapsedContentContainerStyle={{ zIndex: COLLAPSED_LAYER }}
            persistentContentContainerStyle={{ zIndex: PERSISTENT_LAYER }}
        />
    );
};

const getLayerProps = (layer: ReactTestInstance): LayerProps => layer.props as LayerProps;
const getLayer = (screen: ReturnType<typeof render>, marker: number): ReactTestInstance =>
    getDefined(
        screen.UNSAFE_getAllByType(View).find(layer => StyleSheet.flatten(getLayerProps(layer).style).zIndex === marker),
        () => {
            throw new Error(`Layer ${marker} was not rendered`);
        }
    );

const animationExpectations: readonly AnimationExpectation[] = [
    {
        name: 'negative overscroll',
        scrollOffset: NEGATIVE_SCROLL_OFFSET,
        height: EXPANDED_HEIGHT,
        backgroundOpacity: 0,
        expandedOpacity: 1,
        expandedTranslateY: 0,
        expandedScale: 1,
        collapsedOpacity: 0,
        collapsedTranslateY: 10,
    },
    {
        name: 'expanded endpoint',
        scrollOffset: 0,
        height: EXPANDED_HEIGHT,
        backgroundOpacity: 0,
        expandedOpacity: 1,
        expandedTranslateY: 0,
        expandedScale: 1,
        collapsedOpacity: 0,
        collapsedTranslateY: 10,
    },
    {
        name: 'collapsed endpoint',
        scrollOffset: COLLAPSE_DISTANCE,
        height: COLLAPSED_HEIGHT,
        backgroundOpacity: 1,
        expandedOpacity: 0,
        expandedTranslateY: NEGATIVE_SCROLL_OFFSET,
        expandedScale: COLLAPSED_SCALE,
        collapsedOpacity: 1,
        collapsedTranslateY: 0,
    },
    {
        name: 'offset beyond collapse distance',
        scrollOffset: BEYOND_COLLAPSE_SCROLL_OFFSET,
        height: COLLAPSED_HEIGHT,
        backgroundOpacity: 1,
        expandedOpacity: 0,
        expandedTranslateY: NEGATIVE_SCROLL_OFFSET,
        expandedScale: COLLAPSED_SCALE,
        collapsedOpacity: 1,
        collapsedTranslateY: 0,
    },
];

const progressFields: readonly (keyof Pick<
    CollapsibleHeaderMotionConfig,
    | 'expandedOpacityEndProgress'
    | 'collapsedOpacityStartProgress'
    | 'backgroundOpacityStartProgress'
    | 'pointerEventsSwitchProgress'
>)[] = [
    'expandedOpacityEndProgress',
    'collapsedOpacityStartProgress',
    'backgroundOpacityStartProgress',
    'pointerEventsSwitchProgress',
];

const motionConfigExpectations: readonly MotionConfigExpectation[] = [
    ...progressFields.flatMap(field => [
        { name: `${field} below range`, motion: { [field]: -0.1 }, message: `${field} must be between zero and one` },
        { name: `${field} above range`, motion: { [field]: 1.1 }, message: `${field} must be between zero and one` },
    ]),
    {
        name: 'expandedTranslateY',
        motion: { expandedTranslateY: Infinity },
        message: 'expandedTranslateY must be a finite number',
    },
    {
        name: 'collapsedTranslateY',
        motion: { collapsedTranslateY: Infinity },
        message: 'collapsedTranslateY must be a finite number',
    },
    {
        name: 'expandedScale zero',
        motion: { expandedScale: 0 },
        message: 'expandedScale must be a finite number greater than zero',
    },
    {
        name: 'expandedScale non-finite',
        motion: { expandedScale: Infinity },
        message: 'expandedScale must be a finite number greater than zero',
    },
    {
        name: 'opacity order',
        motion: { collapsedOpacityStartProgress: 0.7, expandedOpacityEndProgress: 0.6 },
        message: 'collapsedOpacityStartProgress must be less than or equal to expandedOpacityEndProgress',
    },
];

const customMotionExpectations: readonly CustomMotionExpectation[] = [
    {
        name: 'start endpoint',
        scrollOffset: CUSTOM_COLLAPSE_START,
        height: EXPANDED_HEIGHT,
        backgroundOpacity: 0,
        expandedOpacity: 1,
        collapsedOpacity: 0,
    },
    {
        name: 'intermediate offset',
        scrollOffset: CUSTOM_INTERMEDIATE_SCROLL_OFFSET,
        height: CUSTOM_INTERMEDIATE_HEIGHT,
        backgroundOpacity: 1 / 3,
        expandedOpacity: 1 / 3,
        collapsedOpacity: 0,
    },
    {
        name: 'end endpoint',
        scrollOffset: CUSTOM_COLLAPSE_START + CUSTOM_COLLAPSE_DISTANCE,
        height: COLLAPSED_HEIGHT,
        backgroundOpacity: 1,
        expandedOpacity: 0,
        collapsedOpacity: 1,
    },
];

const expectCustomMotionFrame = (screen: ReturnType<typeof render>, expectation: CustomMotionExpectation) => {
    const background = getLayerProps(getLayer(screen, BACKGROUND_LAYER));
    const header = getLayerProps(getLayer(screen, HEADER_LAYER));
    const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
    const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));
    const backgroundStyle = StyleSheet.flatten(background.style);
    const expandedStyle = StyleSheet.flatten(expanded.style);

    expect(StyleSheet.flatten(header.style)).toMatchObject({ height: expectation.height });
    expect(backgroundStyle.opacity).toBeCloseTo(expectation.backgroundOpacity);
    expect(expandedStyle.opacity).toBeCloseTo(expectation.expandedOpacity);
    expect(expandedStyle.transform).toMatchObject([{ translateY: 0 }, { scale: 1 }]);
    expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
        opacity: expectation.collapsedOpacity,
        transform: [{ translateY: 0 }],
    });
};

export const CollapsibleHeaderTestSupport = {
    BACKGROUND_LAYER,
    HEADER_LAYER,
    EXPANDED_LAYER,
    COLLAPSED_LAYER,
    PERSISTENT_LAYER,
    EXPANDED_HEIGHT,
    COLLAPSED_HEIGHT,
    COLLAPSE_DISTANCE,
    CUSTOM_COLLAPSE_START,
    CUSTOM_COLLAPSE_DISTANCE,
    OUTER_PADDING,
    INVALID_EXPANDED_HEIGHT,
    INTERMEDIATE_SCROLL_OFFSET,
    INTERMEDIATE_HEIGHT,
    INTERMEDIATE_BACKGROUND_OPACITY,
    INTERMEDIATE_SCALE,
    CUSTOM_MOTION,
    Subject,
    getLayerProps,
    getLayer,
    animationExpectations,
    motionConfigExpectations,
    customMotionExpectations,
    expectCustomMotionFrame,
};
