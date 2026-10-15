import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, renderHook } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';

import { useScreenChromeScrollProps } from './use-screen-chrome-scroll-props.hook';

import type { ScreenChromeScrollPropsInterface } from '../../interface/screen-chrome-scroll-props.interface';
import type { ReactNode, Ref } from 'react';
import type { FlatList, ListRenderItem, ScrollView } from 'react-native';

interface ImperativeListHandle {
    readonly scrollToIndex: (index: number) => void;
}

type AttachesTo<Instance, Props extends ScreenChromeScrollPropsInterface<never>> =
    Props['ref'] extends Ref<Instance> ? true : never;

const ATTACHES_TO_FLAT_LIST: AttachesTo<FlatList<string>, ScreenChromeScrollPropsInterface> = true;
const ATTACHES_TO_IMPERATIVE_HANDLE: AttachesTo<ImperativeListHandle, ScreenChromeScrollPropsInterface> = true;
const ATTACHES_TO_INNER_SCROLL_VIEW: AttachesTo<ScrollView, ScreenChromeScrollPropsInterface> = true;
const TYPED_REF_ATTACHES_TO_ITS_HANDLE: AttachesTo<
    ImperativeListHandle,
    ScreenChromeScrollPropsInterface<ImperativeListHandle>
> = true;

const mockScrollHandler = jest.fn();
const mockScrollRef = jest.fn<(instance: unknown) => void>();
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('../use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ onScroll: mockScrollHandler, scrollRef: mockScrollRef }),
}));
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 20, bottom: 30, left: 40 }),
}));

const CONTENT_INSET_TOP = 5;
const CONTENT_INSET_BOTTOM = 7;
const CONSUMER_PADDING_TOP = 99;
const ITEMS = ['first', 'second'];
const SCROLL_EVENT = {
    nativeEvent: {
        contentOffset: { y: 24, x: 0 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
    },
};

const keyExtractor = (item: string): string => item;
const renderItem: ListRenderItem<string> = ({ item }) => <Text>{item}</Text>;

const ChromeFlatList = ({ listRef }: { readonly listRef?: Ref<FlatList<string>> }): ReactNode => {
    const scrollProps = useScreenChromeScrollProps({ ref: listRef, contentInsetTop: CONTENT_INSET_TOP });

    return (
        <Animated.FlatList testID="list" data={ITEMS} keyExtractor={keyExtractor} renderItem={renderItem} {...scrollProps} />
    );
};

describe('useScreenChromeScrollProps', () => {
    it('returns the provider scroll wiring and zero chrome insets by default', () => {
        expect.hasAssertions();

        const { result } = renderHook(() => useScreenChromeScrollProps());

        expect(result.current.onScroll).toBe(mockScrollHandler);
        expect(result.current.scrollEventThrottle).toBe(SCREEN_CHROME_DEFAULT_CONFIG.scrollEventThrottle);
        expect(result.current.automaticallyAdjustsScrollIndicatorInsets).toBe(false);
        expect(result.current.scrollIndicatorInsets).toStrictEqual({ top: 10, bottom: 30 });
        expect(StyleSheet.flatten(result.current.contentContainerStyle)).toStrictEqual({
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 30,
            paddingLeft: 40,
        });
    });

    it('lets consumer padding win in replace mode', () => {
        expect.hasAssertions();

        const { result } = renderHook(() =>
            useScreenChromeScrollProps({
                contentInsetTop: CONTENT_INSET_TOP,
                contentInsetBottom: CONTENT_INSET_BOTTOM,
                contentContainerStyle: { paddingTop: CONSUMER_PADDING_TOP },
            })
        );

        expect(result.current.scrollIndicatorInsets).toStrictEqual({ top: 15, bottom: 37 });
        expect(StyleSheet.flatten(result.current.contentContainerStyle)).toStrictEqual({
            paddingTop: CONSUMER_PADDING_TOP,
            paddingRight: 20,
            paddingBottom: 37,
            paddingLeft: 40,
        });
    });

    it('stacks the computed insets on consumer padding in additive mode', () => {
        expect.hasAssertions();

        const { result } = renderHook(() =>
            useScreenChromeScrollProps({
                contentInsetMode: 'additive',
                contentInsetTop: CONTENT_INSET_TOP,
                contentInsetBottom: CONTENT_INSET_BOTTOM,
                contentContainerStyle: { paddingTop: CONSUMER_PADDING_TOP },
            })
        );

        expect(StyleSheet.flatten(result.current.contentContainerStyle)).toStrictEqual({
            paddingTop: 10 + CONTENT_INSET_TOP + CONSUMER_PADDING_TOP,
            paddingBottom: 30 + CONTENT_INSET_BOTTOM,
        });
    });

    it('keeps the merged ref identity across renders until the consumer ref changes', () => {
        expect.hasAssertions();

        const firstRef: { current: ScrollView | null } = { current: null };
        const secondRef: { current: ScrollView | null } = { current: null };
        const { result, rerender } = renderHook(
            ({ ref }: { readonly ref: Ref<ScrollView> }) => useScreenChromeScrollProps({ ref }),
            { initialProps: { ref: firstRef } }
        );
        const initialMergedRef = result.current.ref;

        rerender({ ref: firstRef });

        expect(result.current.ref).toBe(initialMergedRef);

        rerender({ ref: secondRef });

        expect(result.current.ref).not.toBe(initialMergedRef);
    });
});

describe('useScreenChromeScrollProps on Animated.FlatList', () => {
    it('attaches to any scrollable ref shape without a cast', () => {
        expect.hasAssertions();

        expect([
            ATTACHES_TO_FLAT_LIST,
            ATTACHES_TO_IMPERATIVE_HANDLE,
            ATTACHES_TO_INNER_SCROLL_VIEW,
            TYPED_REF_ATTACHES_TO_ITS_HANDLE,
        ]).toStrictEqual([true, true, true, true]);
    });

    it('wires the spread props into the list', () => {
        expect.hasAssertions();
        mockScrollHandler.mockClear();

        const screen = render(<ChromeFlatList />);
        const list = screen.getByTestId('list');
        const { contentContainerStyle } = list.props;

        fireEvent.scroll(list, SCROLL_EVENT);

        expect(screen.getByText('second')).toBeOnTheScreen();
        expect(mockScrollHandler).toHaveBeenCalledWith(expect.objectContaining(SCROLL_EVENT));
        expect(list).toHaveProp('scrollEventThrottle', SCREEN_CHROME_DEFAULT_CONFIG.scrollEventThrottle);
        expect(list).toHaveProp('automaticallyAdjustsScrollIndicatorInsets', false);
        expect(list).toHaveProp('scrollIndicatorInsets', { top: 15, bottom: 30 });
        expect(StyleSheet.flatten(contentContainerStyle)).toMatchObject({ paddingTop: 15, paddingBottom: 30 });
    });

    it('attaches the list to the chrome ref and a consumer ref together', () => {
        expect.hasAssertions();
        mockScrollRef.mockClear();

        const consumerRef: { current: FlatList<string> | null } = { current: null };
        render(<ChromeFlatList listRef={consumerRef} />);

        expect(consumerRef.current).not.toBeNull();
        expect(mockScrollRef).toHaveBeenCalledTimes(1);
        expect(mockScrollRef).toHaveBeenCalledWith(consumerRef.current);
    });
});
