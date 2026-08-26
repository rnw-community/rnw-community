import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { getAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { ViewStyle } from 'react-native';

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
const CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET =
    CUSTOM_COLLAPSE_START + CUSTOM_COLLAPSE_DISTANCE * CUSTOM_MOTION.pointerEventsSwitchProgress;

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
            testID="header"
            scrollY={scrollY}
            expandedHeight={expandedHeight}
            collapsedHeight={collapsedHeight}
            collapseDistance={collapseDistance}
            collapseStart={collapseStart}
            motion={motion}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getLayerStyle = (layer: string): ViewStyle =>
    getAnimatedStyle(screen.getByTestId(`header-${layer}`, { includeHiddenElements: true }));
const getTransformValue = (style: ViewStyle, index: number, key: string): number => {
    const transform = style.transform as unknown as readonly Record<string, number | undefined>[];

    return transform[index]?.[key] ?? Number.NaN;
};

const expectAnimatedFrame = (frame: AnimatedFrame): void => {
    const expandedStyle = getLayerStyle('expanded');
    const collapsedStyle = getLayerStyle('collapsed');

    expect(getLayerStyle('header').height).toBeCloseTo(frame.height);
    expect(getLayerStyle('background').opacity).toBeCloseTo(frame.backgroundOpacity);
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

describe('CollapsibleHeader animation', () => {
    it.each([
        { name: 'negative overscroll', scrollOffset: NEGATIVE_SCROLL_OFFSET, frame: expandedFrame },
        { name: 'expanded endpoint', scrollOffset: 0, frame: expandedFrame },
        { name: 'collapsed endpoint', scrollOffset: COLLAPSE_DISTANCE, frame: collapsedFrame },
        { name: 'offset beyond collapse distance', scrollOffset: BEYOND_COLLAPSE_SCROLL_OFFSET, frame: collapsedFrame },
        { name: 'intermediate offset', scrollOffset: INTERMEDIATE_SCROLL_OFFSET, frame: intermediateFrame },
    ])('clamps animated layers for $name', ({ scrollOffset, frame }) => {
        expect.hasAssertions();
        render(<Subject scrollOffset={scrollOffset} />);

        expectAnimatedFrame(frame);
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
        { name: 'end endpoint', scrollOffset: 100, height: COLLAPSED_HEIGHT, background: 1, expanded: 0, collapsed: 1 },
    ])('uses custom collapse start and motion at the $name', ({ scrollOffset, height, background, expanded, collapsed }) => {
        expect.hasAssertions();
        render(
            <Subject
                scrollOffset={scrollOffset}
                collapseStart={CUSTOM_COLLAPSE_START}
                collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                motion={CUSTOM_MOTION}
            />
        );

        expect(getLayerStyle('header').height).toBeCloseTo(height);
        expect(getLayerStyle('background').opacity).toBeCloseTo(background);
        expect(getLayerStyle('expanded').opacity).toBeCloseTo(expanded);
        expect(getLayerStyle('collapsed').opacity).toBeCloseTo(collapsed);
    });

    it('uses the default motion value when an override is undefined', () => {
        expect.hasAssertions();
        const motionWithMissingExpandedScale: Pick<Partial<CollapsibleHeaderMotionConfig>, 'expandedScale'> = {};
        render(
            <Subject
                scrollOffset={COLLAPSE_DISTANCE}
                motion={{ expandedScale: motionWithMissingExpandedScale.expandedScale }}
            />
        );

        expect(getTransformValue(getLayerStyle('expanded'), 0, 'translateY')).toBeCloseTo(NEGATIVE_SCROLL_OFFSET);
        expect(getTransformValue(getLayerStyle('expanded'), 1, 'scale')).toBeCloseTo(COLLAPSED_SCALE);
    });
});

describe('CollapsibleHeader endpoint animation', () => {
    it.each([
        [
            'expanded end at start',
            { motion: { expandedOpacityEndProgress: 0, collapsedOpacityStartProgress: 0 } },
            'expanded',
            0,
        ],
        [
            'collapsed before end',
            {
                scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET,
                motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 },
            },
            'collapsed',
            0,
        ],
        [
            'background before end',
            { scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET, motion: { backgroundOpacityStartProgress: 1 } },
            'background',
            0,
        ],
        [
            'collapsed end',
            { scrollOffset: COLLAPSE_DISTANCE, motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 } },
            'collapsed',
            1,
        ],
        [
            'background end',
            { scrollOffset: COLLAPSE_DISTANCE, motion: { backgroundOpacityStartProgress: 1 } },
            'background',
            1,
        ],
    ])('handles endpoint opacity threshold for %s', (_name, subjectProps, layer, opacity) => {
        expect.hasAssertions();
        render(<Subject {...subjectProps} />);

        expect(getLayerStyle(layer).opacity).toBeCloseTo(opacity);
    });

    it('keeps the collapsed layer translation settled at the collapsed endpoint threshold', () => {
        expect.hasAssertions();
        render(
            <Subject
                scrollOffset={COLLAPSE_DISTANCE}
                motion={{ expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 }}
            />
        );

        expect(getTransformValue(getLayerStyle('collapsed'), 0, 'translateY')).toBeCloseTo(0);
    });
});

describe('CollapsibleHeader interaction', () => {
    it.each([
        [0, 'box-none', 'none'],
        [COLLAPSE_DISTANCE * 0.5, 'box-none', 'none'],
        [COLLAPSE_DISTANCE, 'none', 'box-none'],
    ])(
        'keeps only the visible content interactive at scroll offset %s',
        (scrollOffset, expandedPointer, collapsedPointer) => {
            expect.hasAssertions();
            render(<Subject scrollOffset={scrollOffset} />);

            expect(getLayerStyle('expanded').pointerEvents).toBe(expandedPointer);
            expect(getLayerStyle('collapsed').pointerEvents).toBe(collapsedPointer);
        }
    );

    it.each([
        [CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET, 'box-none', 'none'],
        [CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET + 1, 'none', 'box-none'],
    ])('uses the custom pointer-event threshold at scroll offset %s', (scrollOffset, expandedPointer, collapsedPointer) => {
        expect.hasAssertions();
        render(
            <Subject
                scrollOffset={scrollOffset}
                collapseStart={CUSTOM_COLLAPSE_START}
                collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                motion={CUSTOM_MOTION}
            />
        );

        expect(getLayerStyle('expanded').pointerEvents).toBe(expandedPointer);
        expect(getLayerStyle('collapsed').pointerEvents).toBe(collapsedPointer);
    });
});
