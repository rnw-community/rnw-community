import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { getDefined } from '@rnw-community/shared';

import { CollapsibleHeader } from './collapsible-header.js';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface.js';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';

const BACKGROUND_LAYER = 1;
const HEADER_LAYER = 2;
const EXPANDED_LAYER = 3;
const COLLAPSED_LAYER = 4;
const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const OUTER_PADDING = 24;
const INVALID_EXPANDED_HEIGHT = 39;
const NEGATIVE_SCROLL_OFFSET = -20;
const BEYOND_COLLAPSE_SCROLL_OFFSET = 140;
const COLLAPSED_SCALE = 0.9;
const INTERMEDIATE_SCROLL_OFFSET = 75;
const INTERMEDIATE_HEIGHT = 69;
const INTERMEDIATE_BACKGROUND_OPACITY = 1 / 6;
const INTERMEDIATE_SCALE = 0.925;

interface SubjectProps extends Partial<
    Pick<CollapsibleHeaderProps, 'expandedHeight' | 'collapsedHeight' | 'collapseDistance'>
> {
    readonly scrollOffset?: number;
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

const Subject = ({
    scrollOffset = 0,
    expandedHeight = EXPANDED_HEIGHT,
    collapsedHeight = COLLAPSED_HEIGHT,
    collapseDistance = COLLAPSE_DISTANCE,
}: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            accessibilityLabel="Account summary"
            testID="collapsible-header"
            style={{ paddingTop: OUTER_PADDING }}
            scrollY={scrollY}
            expandedHeight={expandedHeight}
            collapsedHeight={collapsedHeight}
            collapseDistance={collapseDistance}
            expandedContent={<Text testID="expanded-content">Expanded</Text>}
            collapsedContent={<Text testID="collapsed-content">Collapsed</Text>}
            backgroundStyle={{ zIndex: BACKGROUND_LAYER }}
            headerStyle={{ zIndex: HEADER_LAYER }}
            expandedContentContainerStyle={{ zIndex: EXPANDED_LAYER }}
            collapsedContentContainerStyle={{ zIndex: COLLAPSED_LAYER }}
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

describe('CollapsibleHeader rendering', () => {
    it('renders caller-owned expanded and collapsed content', () => {
        expect.hasAssertions();
        const { getByTestId } = render(<Subject />);

        expect(getByTestId('expanded-content')).toBeOnTheScreen();
        expect(getByTestId('collapsed-content')).toBeOnTheScreen();
    });

    it('forwards standard view properties and outer style', () => {
        expect.hasAssertions();
        const { getByTestId } = render(<Subject />);
        const root = getByTestId('collapsible-header');

        expect(root).toHaveProp('accessibilityLabel', 'Account summary');
        expect(root).toHaveStyle({ paddingTop: OUTER_PADDING });
    });
});

describe('CollapsibleHeader geometry', () => {
    it.each([
        ['expandedHeight', { expandedHeight: 0 }, 'expandedHeight must be greater than zero'],
        ['collapsedHeight', { collapsedHeight: 0 }, 'collapsedHeight must be greater than zero'],
        ['collapseDistance', { collapseDistance: 0 }, 'collapseDistance must be greater than zero'],
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

describe('CollapsibleHeader animation', () => {
    it.each(animationExpectations)('clamps animated layers for $name', expectation => {
        expect.hasAssertions();
        const screen = render(<Subject scrollOffset={expectation.scrollOffset} />);
        const background = getLayerProps(getLayer(screen, BACKGROUND_LAYER));
        const header = getLayerProps(getLayer(screen, HEADER_LAYER));
        const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
        const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));

        expect(StyleSheet.flatten(header.style)).toMatchObject({ height: expectation.height });
        expect(StyleSheet.flatten(background.style)).toMatchObject({ opacity: expectation.backgroundOpacity });
        expect(StyleSheet.flatten(expanded.style)).toMatchObject({
            opacity: expectation.expandedOpacity,
            transform: [{ translateY: expectation.expandedTranslateY }, { scale: expectation.expandedScale }],
        });
        expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
            opacity: expectation.collapsedOpacity,
            transform: [{ translateY: expectation.collapsedTranslateY }],
        });
    });

    it('interpolates every layer at an intermediate scroll offset', () => {
        expect.hasAssertions();
        const screen = render(<Subject scrollOffset={INTERMEDIATE_SCROLL_OFFSET} />);
        const background = getLayerProps(getLayer(screen, BACKGROUND_LAYER));
        const header = getLayerProps(getLayer(screen, HEADER_LAYER));
        const expanded = getLayerProps(getLayer(screen, EXPANDED_LAYER));
        const collapsed = getLayerProps(getLayer(screen, COLLAPSED_LAYER));

        expect(StyleSheet.flatten(header.style)).toMatchObject({ height: INTERMEDIATE_HEIGHT });
        expect(StyleSheet.flatten(background.style)).toMatchObject({ opacity: INTERMEDIATE_BACKGROUND_OPACITY });
        expect(StyleSheet.flatten(expanded.style)).toMatchObject({
            opacity: 0,
            transform: [{ translateY: -15 }, { scale: INTERMEDIATE_SCALE }],
        });
        expect(StyleSheet.flatten(collapsed.style)).toMatchObject({
            opacity: 0.5,
            transform: [{ translateY: 5 }],
        });
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
