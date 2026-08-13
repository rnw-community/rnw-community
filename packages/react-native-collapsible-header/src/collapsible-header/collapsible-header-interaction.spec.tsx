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

const EXPANDED_LAYER = 3;
const COLLAPSED_LAYER = 4;
const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const CUSTOM_COLLAPSE_START = 20;
const CUSTOM_COLLAPSE_DISTANCE = 80;
const CUSTOM_MOTION: Partial<CollapsibleHeaderMotionConfig> = {
    pointerEventsSwitchProgress: 0.6,
};
const CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET = CUSTOM_COLLAPSE_START + CUSTOM_COLLAPSE_DISTANCE * 0.6;

type SubjectProps = Partial<Pick<CollapsibleHeaderProps, 'collapseDistance' | 'collapseStart' | 'motion'>> & {
    readonly scrollOffset?: number;
};

const Subject = ({ scrollOffset = 0, collapseDistance = COLLAPSE_DISTANCE, collapseStart, motion }: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={collapseDistance}
            collapseStart={collapseStart}
            motion={motion}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
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

            expect(getLayerStyle(getLayer(screen, EXPANDED_LAYER)).pointerEvents).toBe(expectedExpandedPointerEvents);
            expect(getLayerStyle(getLayer(screen, COLLAPSED_LAYER)).pointerEvents).toBe(expectedCollapsedPointerEvents);
        }
    );

    it.each([
        [CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET, 'auto', 'none'],
        [CUSTOM_POINTER_EVENTS_SWITCH_SCROLL_OFFSET + 1, 'none', 'auto'],
    ])(
        'uses the custom pointer-event threshold at scroll offset %s',
        (scrollOffset, expectedExpandedPointerEvents, expectedCollapsedPointerEvents) => {
            expect.hasAssertions();
            const screen = render(
                <Subject
                    scrollOffset={scrollOffset}
                    collapseStart={CUSTOM_COLLAPSE_START}
                    collapseDistance={CUSTOM_COLLAPSE_DISTANCE}
                    motion={CUSTOM_MOTION}
                />
            );

            expect(getLayerStyle(getLayer(screen, EXPANDED_LAYER)).pointerEvents).toBe(expectedExpandedPointerEvents);
            expect(getLayerStyle(getLayer(screen, COLLAPSED_LAYER)).pointerEvents).toBe(expectedCollapsedPointerEvents);
        }
    );
});
