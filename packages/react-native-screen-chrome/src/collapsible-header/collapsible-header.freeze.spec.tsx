import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen } from '@testing-library/react-native';
import React, { Activity, useEffect } from 'react';
import { Freeze } from 'react-freeze';
import { Text } from 'react-native';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import { CollapsibleHeaderTitleSlot } from '../collapsible-header-title-slot/collapsible-header-title-slot';
import { EdgeFade } from '../edge-fade/edge-fade';
import { ScreenChromeProvider } from '../screen-chrome-provider/screen-chrome-provider';

import { CollapsibleHeader } from './collapsible-header';

import type { OnEventFn } from '@rnw-community/shared';
import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';

interface JestAnimatedStyleProps {
    readonly jestAnimatedStyle?: { readonly value: { readonly opacity?: number } };
}

const COLLAPSED_SCROLL_OFFSET = 200;
const FRAME_DURATION = 16;
const HALF_FADE_SCROLL_OFFSET = 40;
const HALF_OPACITY = 0.5;
const SNAP_CONFIG = { snapToCollapse: true };
const FADE_SCROLL_ANIMATION = { opacityInputRange: [0, 80] as const };

jest.mock('expo-blur', () => ({ BlurView: jest.fn(() => null) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.fn(() => null) }));
jest.mock('@react-native-masked-view/masked-view', () => ({ __esModule: true, default: jest.fn(() => null) }));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

type LifecycleBoundary = (props: { readonly hidden: boolean; readonly children: ReactNode }) => ReactNode;

const FreezeBoundary: LifecycleBoundary = ({ hidden, children }) => <Freeze freeze={hidden}>{children}</Freeze>;
const ActivityBoundary: LifecycleBoundary = ({ hidden, children }) => (
    <Activity mode={hidden ? 'hidden' : 'visible'}>{children}</Activity>
);

const ScrollProbe = ({ onScrollY }: { readonly onScrollY: OnEventFn<SharedValue<number>> }) => {
    const { scrollY } = useCollapsibleHeaderScroll();

    useEffect(() => void onScrollY(scrollY), [onScrollY, scrollY]);

    return null;
};

const createSubject =
    (Boundary: LifecycleBoundary, onScrollY: OnEventFn<SharedValue<number>>) =>
    ({ hidden }: { readonly hidden: boolean }) => (
        <ScreenChromeProvider config={SNAP_CONFIG}>
            <ScrollProbe onScrollY={onScrollY} />
            <Boundary hidden={hidden}>
                <EdgeFade testID="fade" position="top" scrollAnimation={FADE_SCROLL_ANIMATION} />
                <CollapsibleHeader testID="header">
                    <CollapsibleHeaderTitleSlot>
                        <Text>Expanded</Text>
                        <Text>Collapsed</Text>
                    </CollapsibleHeaderTitleSlot>
                </CollapsibleHeader>
            </Boundary>
        </ScreenChromeProvider>
    );

const advanceFrame = (): void => {
    act(() => {
        jest.advanceTimersByTime(FRAME_DURATION);
    });
};

const scrollTo = (scrollY: SharedValue<number>, offset: number): void => {
    act(() => {
        scrollY.set(offset);
    });
    advanceFrame();
};

const renderSubject = (Boundary: LifecycleBoundary) => {
    const scrollValues: Array<SharedValue<number>> = [];
    const Subject = createSubject(Boundary, scrollY => void scrollValues.push(scrollY));

    render(<Subject hidden={false} />);

    const [scrollY] = scrollValues;
    const hideAndShow = (): void => {
        screen.rerender(<Subject hidden />);
        screen.rerender(<Subject hidden={false} />);
        advanceFrame();
    };

    return { scrollY, scrollValues, hideAndShow };
};

const getAnimatedOpacity = (testID: string): unknown =>
    (screen.getByTestId(testID, { includeHiddenElements: true }).props as JestAnimatedStyleProps).jestAnimatedStyle?.value
        .opacity;

describe.each([
    ['react-freeze', FreezeBoundary],
    ['React Activity', ActivityBoundary],
])('screen chrome under %s', (_name, Boundary) => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('keeps the provider scroll offset and the collapsed header state across a hide and show cycle', () => {
        expect.hasAssertions();

        const { scrollY, scrollValues, hideAndShow } = renderSubject(Boundary);

        scrollTo(scrollY, COLLAPSED_SCROLL_OFFSET);

        expect(getAnimatedOpacity('header-collapsed')).toBe(1);

        hideAndShow();

        expect(scrollValues.every(value => value === scrollY)).toBe(true);
        expect(scrollY.get()).toBe(COLLAPSED_SCROLL_OFFSET);
        expect(getAnimatedOpacity('header-collapsed')).toBe(1);
        expect(getAnimatedOpacity('header-expanded')).toBe(0);
    });

    it('keeps the edge fade subscribed to the provider scroll offset after a hide and show cycle', () => {
        expect.hasAssertions();

        const { scrollY, hideAndShow } = renderSubject(Boundary);

        hideAndShow();
        scrollTo(scrollY, HALF_FADE_SCROLL_OFFSET);

        expect(getAnimatedOpacity('fade')).toBe(HALF_OPACITY);

        scrollTo(scrollY, COLLAPSED_SCROLL_OFFSET);

        expect(getAnimatedOpacity('fade')).toBe(1);
    });

    it('re-registers snap geometry without a slot conflict after repeated hide and show cycles', () => {
        expect.hasAssertions();

        const { hideAndShow } = renderSubject(Boundary);

        expect(() => {
            hideAndShow();
            hideAndShow();
        }).not.toThrow();
        expect(screen.getByTestId('header-expanded', { includeHiddenElements: true })).toBeOnTheScreen();
    });
});
