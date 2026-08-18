import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React, { forwardRef, useImperativeHandle } from 'react';
import { SectionList, Text } from 'react-native';
import Animated, { scrollTo } from 'react-native-reanimated';

import { emptyFn } from '@rnw-community/shared';

import { CollapsibleHeader } from '../../collapsible-header/collapsible-header';
import { useCollapsibleHeaderScroll } from '../../hooks/use-collapsible-header-scroll/use-collapsible-header-scroll.hook';

import { CollapsibleHeaderProvider } from './collapsible-header-provider';

import type { ComponentRef, ReactElement, Ref } from 'react';
import type { ScrollHandlerProcessed } from 'react-native-reanimated';

jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<Record<string, unknown>>('react-native-reanimated');
    const overrides: Record<string, unknown> = { scrollTo: jest.fn() };

    return new Proxy(actual, {
        get: (target, property: string) => (property in overrides ? overrides[property] : target[property]),
    });
});

type FrameCallback = (time: number) => void;

interface ScrollableListHandle {
    readonly getScrollableNode: () => null;
    readonly scrollToOffset: (offset: number) => void;
}

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_START = 20;
const COLLAPSE_DISTANCE = 80;
const SETTLED_OFFSET = 90;
const SNAP_END = COLLAPSE_START + COLLAPSE_DISTANCE;
const SETTLE_FRAME_COUNT = 3;
const CONTENT_HEIGHT = 1000;
const CONTENT_WIDTH = 320;
const LAYOUT_HEIGHT = 600;
const SCROLLABLE_TEST_ID = 'scrollable';
const ITEMS = ['first', 'second'];
const SECTIONS = [{ data: ITEMS }];

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList<string>);

const renderItem = () => <Text>Item</Text>;

const HandleList = forwardRef<ScrollableListHandle, { readonly onScroll: ScrollHandlerProcessed }>(({ onScroll }, ref) => {
    useImperativeHandle(ref, () => ({ getScrollableNode: () => null, scrollToOffset: emptyFn }));

    return <Animated.ScrollView testID={SCROLLABLE_TEST_ID} onScroll={onScroll} scrollEventThrottle={16} />;
});
HandleList.displayName = 'HandleList';

const ScrollViewRefList = ({
    onScroll,
    refScrollView,
}: {
    readonly onScroll: ScrollHandlerProcessed;
    readonly refScrollView: Ref<ComponentRef<typeof Animated.ScrollView>>;
}) => <Animated.ScrollView testID={SCROLLABLE_TEST_ID} ref={refScrollView} onScroll={onScroll} scrollEventThrottle={16} />;

const ScrollViewProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <Animated.ScrollView testID={SCROLLABLE_TEST_ID} ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} />;
};

const FlatListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <Animated.FlatList
            testID={SCROLLABLE_TEST_ID}
            ref={scrollRef}
            data={ITEMS}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};

const SectionListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return (
        <AnimatedSectionList
            testID={SCROLLABLE_TEST_ID}
            ref={scrollRef}
            sections={SECTIONS}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
    );
};

const HandleListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <HandleList ref={scrollRef} onScroll={onScroll} />;
};

const ScrollViewRefListProbe = () => {
    const { onScroll, scrollRef } = useCollapsibleHeaderScroll();

    return <ScrollViewRefList refScrollView={scrollRef} onScroll={onScroll} />;
};

let pendingFrames: FrameCallback[] = [];

const runFrames = (count: number): void => {
    Array.from({ length: count }).forEach(() => {
        const frames = pendingFrames;
        pendingFrames = [];
        frames.forEach(frame => void frame(0));
    });
};

const renderSnappingScreen = (scrollable: ReactElement): void => {
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
            {scrollable}
        </CollapsibleHeaderProvider>
    );
    const element = screen.getByTestId(SCROLLABLE_TEST_ID);
    const nativeEvent = {
        nativeEvent: {
            contentOffset: { x: 0, y: SETTLED_OFFSET },
            contentSize: { height: CONTENT_HEIGHT, width: CONTENT_WIDTH },
            layoutMeasurement: { height: LAYOUT_HEIGHT, width: CONTENT_WIDTH },
        },
    };

    fireEvent.scroll(element, nativeEvent);
    fireEvent(element, 'scrollEndDrag', nativeEvent);
    runFrames(SETTLE_FRAME_COUNT);
};

describe('CollapsibleHeaderProvider scrollables', () => {
    beforeEach(() => {
        pendingFrames = [];
        jest.mocked(scrollTo).mockClear();
        jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(frame => pendingFrames.push(frame));
    });

    afterEach(() => void jest.restoreAllMocks());

    it.each([
        { name: 'an animated ScrollView', scrollable: <ScrollViewProbe /> },
        { name: 'an animated FlatList', scrollable: <FlatListProbe /> },
        { name: 'an animated SectionList', scrollable: <SectionListProbe /> },
        { name: 'a list exposing an imperative handle ref', scrollable: <HandleListProbe /> },
        { name: 'a list exposing its animated ScrollView ref', scrollable: <ScrollViewRefListProbe /> },
    ])('snaps $name attached to the provider ref', ({ scrollable }) => {
        expect.hasAssertions();

        renderSnappingScreen(scrollable);

        expect(jest.mocked(scrollTo)).toHaveBeenCalledWith(expect.anything(), 0, SNAP_END, true);
    });
});
