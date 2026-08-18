import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import Animated, { scrollTo } from 'react-native-reanimated';

import { CollapsibleHeader } from '../../collapsible-header/collapsible-header';
import { useCollapsibleHeaderScroll } from '../../hooks/use-collapsible-header-scroll/use-collapsible-header-scroll.hook';

import { CollapsibleHeaderProvider } from './collapsible-header-provider';

let mockReducedMotion = false;

jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<Record<string, unknown>>('react-native-reanimated');
    const overrides: Record<string, unknown> = { scrollTo: jest.fn(), useReducedMotion: () => mockReducedMotion };

    return new Proxy(actual, {
        get: (target, property: string) => (property in overrides ? overrides[property] : target[property]),
    });
});

type FrameCallback = (time: number) => void;

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_START = 20;
const COLLAPSE_DISTANCE = 80;
const SETTLED_OFFSET = 40;
const SETTLE_FRAME_COUNT = 3;

let pendingFrames: FrameCallback[] = [];

const runFrames = (count: number): void => {
    Array.from({ length: count }).forEach(() => {
        const frames = pendingFrames;
        pendingFrames = [];
        frames.forEach(frame => void frame(0));
    });
};

const Scrollable = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <Animated.ScrollView testID="scrollable" ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} />;
};

const settleScrollMidTransition = (): void => {
    const screen = render(
        <CollapsibleHeaderProvider>
            <CollapsibleHeader
                snap
                expandedHeight={EXPANDED_HEIGHT}
                collapsedHeight={COLLAPSED_HEIGHT}
                collapseStart={COLLAPSE_START}
                collapseDistance={COLLAPSE_DISTANCE}
                expandedContent={<Text>Expanded</Text>}
                collapsedContent={<Text>Collapsed</Text>}
            />
            <Scrollable />
        </CollapsibleHeaderProvider>
    );
    const element = screen.getByTestId('scrollable');
    const nativeEvent = { nativeEvent: { contentOffset: { x: 0, y: SETTLED_OFFSET } } };

    fireEvent.scroll(element, nativeEvent);
    fireEvent(element, 'scrollEndDrag', nativeEvent);
    runFrames(SETTLE_FRAME_COUNT);
};

describe('CollapsibleHeaderProvider reduced motion', () => {
    beforeEach(() => {
        pendingFrames = [];
        jest.mocked(scrollTo).mockClear();
        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(frame => pendingFrames.push(frame));
    });

    afterEach(() => void jest.restoreAllMocks());

    it('snaps with animation while the system motion setting is untouched', () => {
        expect.hasAssertions();
        mockReducedMotion = false;

        settleScrollMidTransition();

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(expect.anything(), 0, COLLAPSE_START, true);
    });

    it('snaps instantly while the system reduces motion', () => {
        expect.hasAssertions();
        mockReducedMotion = true;

        settleScrollMidTransition();

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(expect.anything(), 0, COLLAPSE_START, false);
    });
});
