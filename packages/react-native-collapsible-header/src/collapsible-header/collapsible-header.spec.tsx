import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import {
    BACKGROUND_LAYER,
    BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET,
    BEYOND_COLLAPSE_SCROLL_OFFSET,
    COLLAPSED_HEIGHT,
    COLLAPSED_LAYER,
    COLLAPSED_SCALE,
    COLLAPSE_DISTANCE,
    CUSTOM_COLLAPSE_DISTANCE,
    CUSTOM_COLLAPSE_START,
    CUSTOM_INTERMEDIATE_HEIGHT,
    EXPANDED_HEIGHT,
    EXPANDED_LAYER,
    HEADER_LAYER,
    INTERMEDIATE_HEIGHT,
    INTERMEDIATE_SCALE,
    INTERMEDIATE_SCROLL_OFFSET,
    INTERMEDIATE_TRANSLATE_Y,
    INVALID_EXPANDED_HEIGHT,
    NEGATIVE_SCROLL_OFFSET,
    OUTER_PADDING,
    PERSISTENT_LAYER,
    Subject,
    getLayer,
    getLayerProps,
} from './collapsible-header.spec.util.js';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface.js';
const INVALID_LOW_PROGRESS = -0.1;
const INVALID_HIGH_PROGRESS = 1.1;
const CUSTOM_MOTION: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.75,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.25,
    pointerEventsSwitchProgress: 0.6,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedTranslateY: 0,
};

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

const progressFields = [
    'expandedOpacityEndProgress',
    'collapsedOpacityStartProgress',
    'backgroundOpacityStartProgress',
    'pointerEventsSwitchProgress',
] as const satisfies readonly (keyof CollapsibleHeaderMotionConfig)[];

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

describe('CollapsibleHeader rendering', () => {
    it('renders caller-owned persistent content once above transition layers', () => {
        expect.hasAssertions();
        const screen = render(<Subject withPersistentContent />);
        const persistentStyle = StyleSheet.flatten(getLayerProps(getLayer(screen, PERSISTENT_LAYER)).style);

        expect(screen.getByTestId('expanded-content')).toBeOnTheScreen();
        expect(screen.getByTestId('collapsed-content')).toBeOnTheScreen();
        expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
        expect(persistentStyle).toMatchObject({ zIndex: PERSISTENT_LAYER });
        expect(persistentStyle.zIndex).toBeGreaterThan(EXPANDED_LAYER);
        expect(persistentStyle.zIndex).toBeGreaterThan(COLLAPSED_LAYER);
        expect(screen.getByTestId('collapsible-header')).toHaveProp('accessibilityLabel', 'Account summary');
        expect(screen.getByTestId('collapsible-header')).toHaveStyle({ paddingTop: OUTER_PADDING });
    });
});

describe('CollapsibleHeader geometry', () => {
    it.each([
        ['expandedHeight', { expandedHeight: 0 }, 'expandedHeight must be greater than zero'],
        ['collapsedHeight', { collapsedHeight: 0 }, 'collapsedHeight must be greater than zero'],
        ['collapseDistance', { collapseDistance: 0 }, 'collapseDistance must be greater than zero'],
        ['collapseStart', { collapseStart: -1 }, 'collapseStart must be a finite number greater than or equal to zero'],
        [
            'height order',
            { expandedHeight: INVALID_EXPANDED_HEIGHT, collapsedHeight: COLLAPSED_HEIGHT },
            'expandedHeight must be greater than or equal to collapsedHeight',
        ],
    ])('rejects invalid %s geometry', (_name, overrides, message) => {
        expect.hasAssertions();

        expect(() => render(<Subject {...overrides} />)).toThrow(message);
    });
});

describe('CollapsibleHeader motion config', () => {
    it.each(
        progressFields.flatMap(field => [
            { field, value: INVALID_LOW_PROGRESS },
            { field, value: INVALID_HIGH_PROGRESS },
        ])
    )('rejects invalid $field progress $value', ({ field, value }) => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ [field]: value }} />)).toThrow(`${field} must be between zero and one`);
    });

    it.each(['expandedTranslateY', 'collapsedTranslateY'] as const)('rejects non-finite %s motion', field => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ [field]: Infinity }} />)).toThrow(`${field} must be a finite number`);
    });

    it.each([0, Infinity])('rejects invalid expandedScale motion %s', expandedScale => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={{ expandedScale }} />)).toThrow(
            'expandedScale must be a finite number greater than zero'
        );
    });

    it('rejects collapsed opacity starting after expanded opacity ends', () => {
        expect.hasAssertions();

        expect(() =>
            render(<Subject motion={{ collapsedOpacityStartProgress: 0.7, expandedOpacityEndProgress: 0.6 }} />)
        ).toThrow('collapsedOpacityStartProgress must be less than or equal to expandedOpacityEndProgress');
    });
});

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
            0,
        ],
        [
            'collapsed before end',
            {
                scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET,
                motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 },
            },
            COLLAPSED_LAYER,
            0,
        ],
        [
            'background before end',
            { scrollOffset: BEFORE_COLLAPSED_ENDPOINT_SCROLL_OFFSET, motion: { backgroundOpacityStartProgress: 1 } },
            BACKGROUND_LAYER,
            0,
        ],
        [
            'collapsed end',
            {
                scrollOffset: COLLAPSE_DISTANCE,
                motion: { expandedOpacityEndProgress: 1, collapsedOpacityStartProgress: 1 },
            },
            COLLAPSED_LAYER,
            1,
        ],
        [
            'background end',
            { scrollOffset: COLLAPSE_DISTANCE, motion: { backgroundOpacityStartProgress: 1 } },
            BACKGROUND_LAYER,
            1,
        ],
    ])('handles endpoint opacity threshold for %s', (_name, subjectProps, layer, opacity) => {
        expect.hasAssertions();
        const screen = render(<Subject {...subjectProps} />);

        expect(StyleSheet.flatten(getLayerProps(getLayer(screen, layer)).style)).toMatchObject({ opacity });
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
