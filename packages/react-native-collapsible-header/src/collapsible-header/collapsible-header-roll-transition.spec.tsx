import { describe, expect, it } from '@jest/globals';
import { render, screen, within } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { getAnimatedStyle as getReanimatedAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { CollapsibleHeader } from './collapsible-header';

import type { CollapsibleHeaderProps } from '../interface/collapsible-header-props.interface';
import type { StyleProp, ViewStyle } from 'react-native';

const getAnimatedStyle = getReanimatedAnimatedStyle as unknown as (component: { readonly props: object }) => ViewStyle;

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_DISTANCE = 100;
const FADE_START_SCROLL_OFFSET = 50;
const HALFWAY_THROUGH_FADE_SCROLL_OFFSET = 75;
const COLLAPSED_SCROLL_OFFSET = 100;
const CUSTOM_ROLL_DISTANCE = 24;
const DEFAULT_FADE_TRANSLATE_Y = 10;

type SubjectProps = Partial<Pick<CollapsibleHeaderProps, 'collapsedTransition' | 'motion'>> & {
    readonly scrollOffset?: number;
};

const Subject = ({ scrollOffset = 0, collapsedTransition, motion }: SubjectProps) => {
    const scrollY = useSharedValue(scrollOffset);

    return (
        <CollapsibleHeader
            testID="header"
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapseDistance={COLLAPSE_DISTANCE}
            collapsedTransition={collapsedTransition}
            motion={motion}
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const UnlabelledRollSubject = () => {
    const scrollY = useSharedValue(COLLAPSED_SCROLL_OFFSET);

    return (
        <CollapsibleHeader
            scrollY={scrollY}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
            collapsedTransition="roll"
            expandedContent={<Text>Expanded</Text>}
            collapsedContent={<Text>Collapsed</Text>}
        />
    );
};

const getCollapsedLayer = () => screen.getByTestId('header-collapsed', { includeHiddenElements: true });
const queryCollapsedClip = () => screen.queryByTestId('header-collapsed-clip', { includeHiddenElements: true });
const getCollapsedStyle = (): ViewStyle => getAnimatedStyle(getCollapsedLayer());
const getCollapsedTranslateY = (): number => {
    const transform = getCollapsedStyle().transform as unknown as readonly { readonly translateY?: number }[];

    return transform[0]?.translateY ?? Number.NaN;
};

describe('CollapsibleHeader collapsed transition', () => {
    it('should keep the fade layer tree and translation when the transition is omitted', () => {
        expect.hasAssertions();

        render(<Subject />);

        expect(queryCollapsedClip()).toBeNull();
        expect(
            within(screen.getByTestId('header-header', { includeHiddenElements: true })).getByTestId('header-collapsed', {
                includeHiddenElements: true,
            })
        ).toBeTruthy();
        expect(getCollapsedTranslateY()).toBeCloseTo(DEFAULT_FADE_TRANSLATE_Y);
    });

    it('should render the fade transition identically to the default when requested explicitly', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="fade" />);

        expect(queryCollapsedClip()).toBeNull();
        expect(getCollapsedTranslateY()).toBeCloseTo(DEFAULT_FADE_TRANSLATE_Y);
    });

    it('should clip the rolling collapsed layer to a touch-transparent collapsed-height bar', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="roll" />);

        const clip = screen.getByTestId('header-collapsed-clip', { includeHiddenElements: true });
        const clipStyle = StyleSheet.flatten((clip.props as { readonly style: StyleProp<ViewStyle> }).style) ?? {};

        expect(clipStyle).toMatchObject({
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            height: COLLAPSED_HEIGHT,
            overflow: 'hidden',
            pointerEvents: 'box-none',
        });
        expect(clipStyle.bottom).toBeUndefined();
        expect(within(clip).getByTestId('header-collapsed', { includeHiddenElements: true })).toBeTruthy();
    });

    it('should hold rolling content one collapsed bar below the clip edge until the fade starts', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="roll" scrollOffset={FADE_START_SCROLL_OFFSET} />);

        expect(getCollapsedTranslateY()).toBeCloseTo(COLLAPSED_HEIGHT);
        expect(getCollapsedStyle().opacity).toBeCloseTo(0);
    });

    it('should roll content halfway up while fading it halfway in', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="roll" scrollOffset={HALFWAY_THROUGH_FADE_SCROLL_OFFSET} />);

        expect(getCollapsedTranslateY()).toBeCloseTo(COLLAPSED_HEIGHT / 2);
        expect(getCollapsedStyle().opacity).toBeCloseTo(0.5);
    });

    it('should settle rolling content in place at the collapsed endpoint with interaction handed over', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="roll" scrollOffset={COLLAPSED_SCROLL_OFFSET} />);

        expect(getCollapsedTranslateY()).toBeCloseTo(0);
        expect(getCollapsedStyle()).toMatchObject({ opacity: 1, pointerEvents: 'box-none' });
        expect(screen.getByText('Collapsed')).toBeOnTheScreen();
    });

    it('should leave the clip without a testID when the header has none', () => {
        expect.hasAssertions();

        render(<UnlabelledRollSubject />);

        expect(screen.getByText('Collapsed')).toBeOnTheScreen();
        expect(queryCollapsedClip()).toBeNull();
    });

    it('should let an explicit collapsedTranslateY override the rolling distance', () => {
        expect.hasAssertions();

        render(<Subject collapsedTransition="roll" motion={{ collapsedTranslateY: CUSTOM_ROLL_DISTANCE }} />);

        expect(getCollapsedTranslateY()).toBeCloseTo(CUSTOM_ROLL_DISTANCE);
    });
});
