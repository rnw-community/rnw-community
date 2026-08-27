import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { getAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderMotionConfig } from '../interface/collapsible-header-motion-config.interface';
import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { ViewProps, ViewStyle } from 'react-native';

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const LATE_CROSS_FADE_MOTION: Partial<CollapsibleHeaderMotionConfig> = {
    expandedOpacityEndProgress: 0.75,
    collapsedOpacityStartProgress: 0.5,
};
const LATE_CROSS_FADE_SWITCH_SCROLL_OFFSET = 62.5;
const AFTER_LATE_CROSS_FADE_SWITCH_SCROLL_OFFSET = 63;
const PAST_COLLAPSE_INTERVAL_MIDPOINT_SCROLL_OFFSET = 51;
const DEFAULT_CROSS_FADE_SWITCH_SCROLL_OFFSET = 55;
const AFTER_DEFAULT_CROSS_FADE_SWITCH_SCROLL_OFFSET = 56;

type SubjectProps = Partial<Pick<CollapsibleHeaderProps, 'motion'>> & {
    readonly scrollOffset?: number;
};

const Subject = ({ scrollOffset = 0, motion }: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            testID="header"
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            motion={motion}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getLayerStyle = (layer: string): ViewStyle =>
    getAnimatedStyle(screen.getByTestId(`header-${layer}`, { includeHiddenElements: true }));
const getLayerAccessibility = (
    layer: string
): Pick<ViewProps, 'accessibilityElementsHidden' | 'importantForAccessibility'> =>
    screen.getByTestId(`header-${layer}`, { includeHiddenElements: true }).props;

describe('CollapsibleHeader accessibility handoff', () => {
    it.each([
        { name: 'expanded endpoint', scrollOffset: 0, exposed: 'expanded', hidden: 'collapsed', opacity: 1 },
        {
            name: 'collapse interval midpoint before the cross-fade midpoint',
            scrollOffset: PAST_COLLAPSE_INTERVAL_MIDPOINT_SCROLL_OFFSET,
            exposed: 'expanded',
            hidden: 'collapsed',
            opacity: 0.32,
        },
        {
            name: 'cross-fade midpoint',
            scrollOffset: LATE_CROSS_FADE_SWITCH_SCROLL_OFFSET,
            exposed: 'expanded',
            hidden: 'collapsed',
            opacity: 1 / 6,
        },
        {
            name: 'offset past the cross-fade midpoint',
            scrollOffset: AFTER_LATE_CROSS_FADE_SWITCH_SCROLL_OFFSET,
            exposed: 'collapsed',
            hidden: 'expanded',
            opacity: 0.26,
        },
        {
            name: 'collapsed endpoint',
            scrollOffset: COLLAPSE_DISTANCE,
            exposed: 'collapsed',
            hidden: 'expanded',
            opacity: 1,
        },
    ])('exposes only visible content at the $name', ({ scrollOffset, exposed, hidden, opacity }) => {
        expect.hasAssertions();
        render(<Subject scrollOffset={scrollOffset} motion={LATE_CROSS_FADE_MOTION} />);
        const exposedStyle = getLayerStyle(exposed);
        const hiddenStyle = getLayerStyle(hidden);

        expect(getLayerAccessibility(exposed)).toMatchObject({
            accessibilityElementsHidden: false,
            importantForAccessibility: 'auto',
        });
        expect(getLayerAccessibility(hidden)).toMatchObject({
            accessibilityElementsHidden: true,
            importantForAccessibility: 'no-hide-descendants',
        });
        expect(exposedStyle.opacity).toBeCloseTo(opacity);
        expect(exposedStyle.opacity).toBeGreaterThan(0);
        expect(exposedStyle.pointerEvents).toBe('box-none');
        expect(hiddenStyle.pointerEvents).toBe('none');
    });

    it.each([
        {
            name: 'at the default cross-fade midpoint',
            scrollOffset: DEFAULT_CROSS_FADE_SWITCH_SCROLL_OFFSET,
            expandedPointer: 'box-none',
            collapsedPointer: 'none',
        },
        {
            name: 'past the default cross-fade midpoint',
            scrollOffset: AFTER_DEFAULT_CROSS_FADE_SWITCH_SCROLL_OFFSET,
            expandedPointer: 'none',
            collapsedPointer: 'box-none',
        },
    ])('switches layers $name', ({ scrollOffset, expandedPointer, collapsedPointer }) => {
        expect.hasAssertions();
        render(<Subject scrollOffset={scrollOffset} />);

        expect(getLayerStyle('expanded').pointerEvents).toBe(expandedPointer);
        expect(getLayerStyle('collapsed').pointerEvents).toBe(collapsedPointer);
    });

    it('keeps an explicit switch progress ahead of the derived cross-fade midpoint', () => {
        expect.hasAssertions();
        render(
            <Subject
                scrollOffset={PAST_COLLAPSE_INTERVAL_MIDPOINT_SCROLL_OFFSET}
                motion={{ ...LATE_CROSS_FADE_MOTION, pointerEventsSwitchProgress: 0.5 }}
            />
        );

        expect(getLayerStyle('expanded').pointerEvents).toBe('none');
        expect(getLayerStyle('collapsed').pointerEvents).toBe('box-none');
        expect(getLayerAccessibility('collapsed')).toMatchObject({ accessibilityElementsHidden: false });
    });
});
