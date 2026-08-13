import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const BACKGROUND_LAYER = 1;
const HEADER_LAYER = 2;
const EXPANDED_LAYER = 3;
const COLLAPSED_LAYER = 4;
const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const CUSTOM_COLLAPSE_START = 20;
const CUSTOM_COLLAPSE_DISTANCE = 80;
const NEGATIVE_SCROLL_OFFSET = -20;
const BEYOND_COLLAPSE_SCROLL_OFFSET = 140;
const INTERMEDIATE_SCROLL_OFFSET = 75;
const INTERMEDIATE_HEIGHT = 69;
const INTERMEDIATE_TRANSLATE_Y = -15;
const CUSTOM_INTERMEDIATE_HEIGHT = 98;
const BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET = 50;
const COLLAPSED_SCALE = 0.9;
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
type SubjectProps = Partial<
    Pick<CollapsibleHeaderProps, 'collapseDistance' | 'collapseStart' | 'collapsedHeight' | 'expandedHeight' | 'motion'>
> & {
    readonly scrollOffset?: number;
};

interface AnimatedFrame {
    readonly height: number;
    readonly backgroundOpacity: number;
    readonly expandedOpacity: number;
    readonly expandedTranslateY: number;
    readonly expandedScale: number;
    readonly collapsedOpacity: number;
    readonly collapsedTranslateY: number;
}

const Subject = ({
    scrollOffset = 0,
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
    collapseStart,
    motion,
}: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            style={{}}
            scrollY={scrollY}
            expandedHeight={expandedHeight}
            collapsedHeight={collapsedHeight}
            collapseDistance={collapseDistance}
            collapseStart={collapseStart}
            motion={motion}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
            backgroundStyle={{ zIndex: BACKGROUND_LAYER }}
            headerStyle={{ zIndex: HEADER_LAYER }}
            expandedContentContainerStyle={{ zIndex: EXPANDED_LAYER }}
            collapsedContentContainerStyle={{ zIndex: COLLAPSED_LAYER }}
        />
    );
};

const getLayerStyle = (layer: ReactTestInstance): ViewStyle =>
    StyleSheet.flatten((layer.props as { style: StyleProp<ViewStyle> }).style);
const getLayer = (screen: ReturnType<typeof render>, marker: number): ReactTestInstance =>
    getDefined(
        screen.UNSAFE_getAllByType(View).find(layer => getLayerStyle(layer).zIndex === marker),
        () => {
            throw new Error(`Layer ${marker} was not rendered`);
        }
    );
const getTransformValue = (style: ViewStyle, index: number, key: string): number => {
    const transform = style.transform as unknown as readonly Record<string, number | undefined>[];

    return transform[index]?.[key] ?? Number.NaN;
};

const expectAnimatedFrame = (screen: ReturnType<typeof render>, frame: AnimatedFrame): void => {
    const backgroundStyle = getLayerStyle(getLayer(screen, BACKGROUND_LAYER));
    const headerStyle = getLayerStyle(getLayer(screen, HEADER_LAYER));
    const expandedStyle = getLayerStyle(getLayer(screen, EXPANDED_LAYER));
    const collapsedStyle = getLayerStyle(getLayer(screen, COLLAPSED_LAYER));

    expect(headerStyle.height).toBeCloseTo(frame.height);
    expect(backgroundStyle.opacity).toBeCloseTo(frame.backgroundOpacity);
    expect(expandedStyle.opacity).toBeCloseTo(frame.expandedOpacity);
    expect(getTransformValue(expandedStyle, 0, 'translateY')).toBeCloseTo(frame.expandedTranslateY);
    expect(getTransformValue(expandedStyle, 1, 'scale')).toBeCloseTo(frame.expandedScale);
    expect(collapsedStyle.opacity).toBeCloseTo(frame.collapsedOpacity);
    expect(getTransformValue(collapsedStyle, 0, 'translateY')).toBeCloseTo(frame.collapsedTranslateY);
};

const expandedFrame: AnimatedFrame = {
    height: EXPANDED_HEIGHT,
    backgroundOpacity: 0,
    expandedOpacity: 1,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedOpacity: 0,
    collapsedTranslateY: 10,
};
const collapsedFrame: AnimatedFrame = {
    height: COLLAPSED_HEIGHT,
    backgroundOpacity: 1,
    expandedOpacity: 0,
    expandedTranslateY: NEGATIVE_SCROLL_OFFSET,
    expandedScale: COLLAPSED_SCALE,
    collapsedOpacity: 1,
    collapsedTranslateY: 0,
};
const intermediateFrame: AnimatedFrame = {
    height: INTERMEDIATE_HEIGHT,
    backgroundOpacity: 1 / 6,
    expandedOpacity: 0,
    expandedTranslateY: INTERMEDIATE_TRANSLATE_Y,
    expandedScale: INTERMEDIATE_SCALE,
    collapsedOpacity: 0.5,
    collapsedTranslateY: 5,
};
const animationExpectationRows = [
    { name: 'negative overscroll', scrollOffset: NEGATIVE_SCROLL_OFFSET, frame: expandedFrame },
    { name: 'expanded endpoint', scrollOffset: 0, frame: expandedFrame },
    { name: 'collapsed endpoint', scrollOffset: COLLAPSE_DISTANCE, frame: collapsedFrame },
    { name: 'offset beyond collapse distance', scrollOffset: BEYOND_COLLAPSE_SCROLL_OFFSET, frame: collapsedFrame },
    { name: 'intermediate offset', scrollOffset: INTERMEDIATE_SCROLL_OFFSET, frame: intermediateFrame },
];

describe('CollapsibleHeader animation', () => {
    it.each(animationExpectationRows)('clamps animated layers for $name', ({ scrollOffset, frame }) => {
        expect.hasAssertions();
        const screen = render(<Subject scrollOffset={scrollOffset} />);

        expectAnimatedFrame(screen, frame);
    });

    it.each([
        {
            name: 'start endpoint',
            scrollOffset: CUSTOM_COLLAPSE_START,
            height: EXPANDED_HEIGHT,
            background: 0,
            expanded: 1,
            collapsed: 0,
        },
        {
            name: 'intermediate offset',
            scrollOffset: 60,
            height: CUSTOM_INTERMEDIATE_HEIGHT,
            background: 1 / 3,
            expanded: 1 / 3,
            collapsed: 0,
        },
        {
            name: 'end endpoint',
            scrollOffset: CUSTOM_COLLAPSE_START + CUSTOM_COLLAPSE_DISTANCE,
            height: COLLAPSED_HEIGHT,
            background: 1,
            expanded: 0,
            collapsed: 1,
        },
    ])('uses custom collapse start and motion at the $name', ({ scrollOffset, height, background, expanded, collapsed }) => {
        expect.hasAssertions();
        const screen = render(
            <Subject
                scrollOffset={scrollOffset}
                collapseStart={CUSTOM_COLLAPSE_START}
                collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                motion={CUSTOM_MOTION}
            />
        );
        const expandedStyle = getLayerStyle(getLayer(screen, EXPANDED_LAYER));
        const collapsedStyle = getLayerStyle(getLayer(screen, COLLAPSED_LAYER));

        expect(getLayerStyle(getLayer(screen, HEADER_LAYER)).height).toBeCloseTo(height);
        expect(getLayerStyle(getLayer(screen, BACKGROUND_LAYER)).opacity).toBeCloseTo(background);
        expect(expandedStyle.opacity).toBeCloseTo(expanded);
        expect(getTransformValue(expandedStyle, 0, 'translateY')).toBeCloseTo(0);
        expect(getTransformValue(expandedStyle, 1, 'scale')).toBeCloseTo(1);
        expect(collapsedStyle.opacity).toBeCloseTo(collapsed);
        expect(getTransformValue(collapsedStyle, 0, 'translateY')).toBeCloseTo(0);
    });

    it('uses the default motion value when an override is undefined', () => {
        expect.hasAssertions();
        const motionWithMissingExpandedScale: Pick<Partial<CollapsibleHeaderMotionConfig>, 'expandedScale'> = {};
        const screen = render(
            <Subject
                scrollOffset={COLLAPSE_DISTANCE}
                motion={{ expandedScale: motionWithMissingExpandedScale.expandedScale }}
            />
        );
        const expandedStyle = getLayerStyle(getLayer(screen, EXPANDED_LAYER));

        expect(getTransformValue(expandedStyle, 0, 'translateY')).toBeCloseTo(NEGATIVE_SCROLL_OFFSET);
        expect(getTransformValue(expandedStyle, 1, 'scale')).toBeCloseTo(COLLAPSED_SCALE);
    });
});

describe('CollapsibleHeader endpoint animation', () => {
    it.each([
        [
            'expanded end at start',
            { motion: { expandedOpacityEndProgress: 0, collapsedOpacityStartProgress: 0 } },
            EXPANDED_LAYER,
            { opacity: 0 },
        ],
        [
            'collapsed before end',
            {
                scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET,
                motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 },
            },
            COLLAPSED_LAYER,
            { opacity: 0, transform: [{ translateY: 10 }] },
        ],
        [
            'background before end',
            { scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET, motion: { backgroundOpacityStartProgress: 1 } },
            BACKGROUND_LAYER,
            { opacity: 0 },
        ],
        [
            'collapsed end',
            {
                scrollOffset: COLLAPSE_DISTANCE,
                motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 },
            },
            COLLAPSED_LAYER,
            { opacity: 1, transform: [{ translateY: 0 }] },
        ],
        [
            'background end',
            { scrollOffset: COLLAPSE_DISTANCE, motion: { backgroundOpacityStartProgress: 1 } },
            BACKGROUND_LAYER,
            { opacity: 1 },
        ],
    ])('handles endpoint opacity threshold for %s', (_name, subjectProps, layer, style) => {
        expect.hasAssertions();
        const screen = render(<Subject {...subjectProps} />);

        expect(getLayerStyle(getLayer(screen, layer))).toMatchObject(style);
    });
});
