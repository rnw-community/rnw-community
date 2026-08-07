import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet } from 'react-native';

import { CollapsibleHeaderTestSupport } from './collapsible-header.spec.support.js';

const {
    BACKGROUND_LAYER,
    HEADER_LAYER,
    EXPANDED_LAYER,
    COLLAPSED_LAYER,
    PERSISTENT_LAYER,
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
} = CollapsibleHeaderTestSupport;

describe('CollapsibleHeader rendering', () => {
    it('renders caller-owned expanded and collapsed content', () => {
        expect.hasAssertions();
        const { getByTestId } = render(<Subject />);

        expect(getByTestId('expanded-content')).toBeOnTheScreen();
        expect(getByTestId('collapsed-content')).toBeOnTheScreen();
    });

    it('renders caller-owned persistent content once above transition layers', () => {
        expect.hasAssertions();
        const screen = render(<Subject withPersistentContent />);
        const persistentLayer = getLayerProps(getLayer(screen, PERSISTENT_LAYER));
        const persistentStyle = StyleSheet.flatten(persistentLayer.style);

        expect(screen.getAllByTestId('persistent-content')).toHaveLength(1);
        expect(persistentStyle).toMatchObject({ zIndex: PERSISTENT_LAYER });
        expect(persistentStyle.zIndex).toBeGreaterThan(EXPANDED_LAYER);
        expect(persistentStyle.zIndex).toBeGreaterThan(COLLAPSED_LAYER);
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
        ['collapseStart', { collapseStart: -1 }, 'collapseStart must be greater than or equal to zero'],
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
    it.each(motionConfigExpectations)('rejects invalid $name motion', expectation => {
        expect.hasAssertions();

        expect(() => render(<Subject motion={expectation.motion} />)).toThrow(expectation.message);
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

    it.each(customMotionExpectations)('uses custom collapse start and motion at the $name', expectation => {
        expect.hasAssertions();
        const screen = render(
            <Subject
                scrollOffset={expectation.scrollOffset}
                collapseStart={CUSTOM_COLLAPSE_START}
                collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                motion={CUSTOM_MOTION}
            />
        );

        expectCustomMotionFrame(screen, expectation);
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
