import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { ViewProps } from 'react-native';
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
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance' | 'collapseStart' | 'motion'>
> & {
    readonly scrollOffset?: number;
};

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

const getLayerProps = (layer: ReactTestInstance): ViewProps => layer.props;
const getLayer = (screen: ReturnType<typeof render>, marker: number): ReactTestInstance =>
    getDefined(
        screen.UNSAFE_getAllByType(View).find(layer => StyleSheet.flatten(getLayerProps(layer).style).zIndex === marker),
        () => {
            throw new Error(`Layer ${marker} was not rendered`);
        }
    );

const expandedFrame = [EXPANDED_HEIGHT, 0, 1, 0, 1, 0, 10] as const;
const collapsedFrame = [COLLAPSED_HEIGHT, 1, 0, NEGATIVE_SCROLL_OFFSET, COLLAPSED_SCALE, 1, 0] as const;
const animationExpectations = [
    ['negative overscroll', NEGATIVE_SCROLL_OFFSET, ...expandedFrame],
    ['expanded endpoint', 0, ...expandedFrame],
    ['collapsed endpoint', COLLAPSE_DISTANCE, ...collapsedFrame],
    ['offset beyond collapse distance', BEYOND_COLLAPSE_SCROLL_OFFSET, ...collapsedFrame],
    [
        'intermediate offset',
        INTERMEDIATE_SCROLL_OFFSET,
        INTERMEDIATE_HEIGHT,
        1 / 6,
        0,
        INTERMEDIATE_TRANSLATE_Y,
        INTERMEDIATE_SCALE,
        0.5,
        5,
    ],
] as const;
const animationExpectationRows = animationExpectations.map(expectation => ({ expectation }));

const customMotionExpectations = [
    ['start endpoint', CUSTOM_COLLAPSE_START, EXPANDED_HEIGHT, 0, 1, 0],
    ['intermediate offset', 60, CUSTOM_INTERMEDIATE_HEIGHT, 1 / 3, 1 / 3, 0],
    ['end endpoint', CUSTOM_COLLAPSE_START + CUSTOM_COLLAPSE_DISTANCE, COLLAPSED_HEIGHT, 1, 0, 1],
] as const;
const customMotionExpectationRows = customMotionExpectations.map(expectation => ({ expectation }));

const expectCustomMotionFrame = (
    screen: ReturnType<typeof render>,
    expectation: (typeof customMotionExpectations)[number]
) => {
    const [_name, _scrollOffset, height, backgroundOpacity, expandedOpacity, collapsedOpacity] = expectation;
    const background = getLayerProps(getLayer(screen, BACKGROUND_LAYER));
    const header = getLayerProps(getLayer(screen, HEADER_LAYER));
    const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
    const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));
    const backgroundStyle = StyleSheet.flatten(background.style);
    const expandedStyle = StyleSheet.flatten(expanded.style);

    expect(StyleSheet.flatten(header.style)).toMatchObject({ height });
    expect(backgroundStyle.opacity).toBeCloseTo(backgroundOpacity);
    expect(expandedStyle.opacity).toBeCloseTo(expandedOpacity);
    expect(expandedStyle.transform).toMatchObject([{ translateY: 0 }, { scale: 1 }]);
    expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
        opacity: collapsedOpacity,
        transform: [{ translateY: 0 }],
    });
};

describe('CollapsibleHeader animation', () => {
    it.each(animationExpectationRows)('clamps animated layers for $expectation.0', ({ expectation }) => {
        expect.hasAssertions();
        const [
            _name,
            scrollOffset,
            height,
            backgroundOpacity,
            expandedOpacity,
            expandedTranslateY,
            expandedScale,
            collapsedOpacity,
            collapsedTranslateY,
        ] = expectation;
        const screen = render(<Subject scrollOffset={scrollOffset} />);
        const background = getLayerProps(getLayer(screen, BACKGROUND_LAYER));
        const header = getLayerProps(getLayer(screen, HEADER_LAYER));
        const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
        const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));

        expect(StyleSheet.flatten(header.style)).toMatchObject({ height });
        expect(StyleSheet.flatten(background.style)).toMatchObject({ opacity: backgroundOpacity });
        expect(StyleSheet.flatten(expanded.style)).toMatchObject({
            opacity: expandedOpacity,
            transform: [{ translateY: expandedTranslateY }, { scale: expandedScale }],
        });
        expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
            opacity: collapsedOpacity,
            transform: [{ translateY: collapsedTranslateY }],
        });
    });

    it.each(customMotionExpectationRows)(
        'uses custom collapse start and motion at the $expectation.0',
        ({ expectation }) => {
            expect.hasAssertions();
            const [_name, scrollOffset] = expectation;
            const screen = render(
                <Subject
                    scrollOffset={scrollOffset}
                    collapseStart={CUSTOM_COLLAPSE_START}
                    collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                    motion={CUSTOM_MOTION}
                />
            );

            expectCustomMotionFrame(screen, expectation);
        }
    );
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
            { opacity: 0 },
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

        expect(StyleSheet.flatten(getLayerProps(getLayer(screen, layer)).style)).toMatchObject(style);
    });
});

describe('CollapsibleHeader interaction', () => {
    it.each([
        [0, 'auto', 'none'],
        [COLLAPSE_DISTANCE * 0.5, 'auto', 'none'],
        [COLLAPSE_DISTANCE, 'none', 'auto'],
    ])(
        'keeps only the visible content interactive at scroll offset %s',
        (scrollOffset, expectedExpandedPointerEvents, expectedCollapsedPointerEvents) => {
            expect.hasAssertions();
            const screen = render(<Subject scrollOffset={scrollOffset} />);
            const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
            const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));

            expect(expanded.pointerEvents).toBe(expectedExpandedPointerEvents);
            expect(collapsed.pointerEvents).toBe(expectedCollapsedPointerEvents);
        }
    );
});
