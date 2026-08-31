import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { ScreenChromeScrollView } from './screen-chrome-scroll-view';

import type { ComponentProps } from 'react';
import type { ScrollView } from 'react-native';

type ScreenChromeScrollViewProps = ComponentProps<typeof ScreenChromeScrollView>;
type PackageOwnedScrollProp<Prop extends string> = Prop extends keyof ScreenChromeScrollViewProps ? never : true;

const ON_SCROLL_IS_PACKAGE_OWNED: PackageOwnedScrollProp<'onScroll'> = true;
const SCROLL_EVENT_THROTTLE_IS_PACKAGE_OWNED: PackageOwnedScrollProp<'scrollEventThrottle'> = true;

const mockScrollHandler = jest.fn();
const mockScrollRef = jest.fn<(instance: ScrollView | null) => void>();
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('../hooks/use-screen-chrome/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig }),
}));
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ onScroll: mockScrollHandler, scrollRef: mockScrollRef }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({
        top: 10,
        right: 20,
        bottom: 30,
        left: 40,
    }),
}));

const CONTENT_INSET_TOP = 5;
const CONTENT_INSET_BOTTOM = 7;
const CONSUMER_PADDING_TOP = 99;
const CONSUMER_SCROLL_EVENT_THROTTLE = 1;
const SCROLL_EVENT = { nativeEvent: { contentOffset: { y: 24, x: 0 } } };

describe('ScreenChromeScrollView', () => {
    it('uses zero chrome insets when custom values are omitted', () => {
        expect.hasAssertions();

        const screen = render(<ScreenChromeScrollView testID="default-scroll" />);
        const scrollView = screen.getByTestId('default-scroll');
        const { contentContainerStyle } = scrollView.props;

        expect(StyleSheet.flatten(contentContainerStyle)).toMatchObject({
            paddingTop: 10,
            paddingRight: 20,
            paddingBottom: 30,
            paddingLeft: 40,
        });
    });

    it('forwards scroll props and connects provider scroll state', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeScrollView
                testID="scroll"
                contentInsetTop={CONTENT_INSET_TOP}
                contentInsetBottom={CONTENT_INSET_BOTTOM}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingTop: CONSUMER_PADDING_TOP }}
            >
                <Text>Row</Text>
            </ScreenChromeScrollView>
        );
        const scrollView = screen.getByTestId('scroll');
        const { contentContainerStyle } = scrollView.props;

        expect(scrollView).toHaveProp('keyboardShouldPersistTaps', 'handled');
        expect(scrollView).toHaveProp('onScroll', mockScrollHandler);
        expect(scrollView).toHaveProp('scrollEventThrottle', SCREEN_CHROME_DEFAULT_CONFIG.scrollEventThrottle);
        expect(StyleSheet.flatten(contentContainerStyle)).toMatchObject({
            paddingTop: CONSUMER_PADDING_TOP,
            paddingRight: 20,
            paddingBottom: 37,
            paddingLeft: 40,
        });
    });

    it('keeps the provider scroll handler when a consumer forces its own onScroll', () => {
        expect.hasAssertions();

        const consumerScrollHandler = jest.fn();
        const forcedProps = { onScroll: consumerScrollHandler } as unknown as ScreenChromeScrollViewProps;
        const screen = render(<ScreenChromeScrollView testID="scroll" {...forcedProps} />);
        const scrollView = screen.getByTestId('scroll');

        fireEvent.scroll(scrollView, SCROLL_EVENT);

        expect(ON_SCROLL_IS_PACKAGE_OWNED).toBe(true);
        expect(mockScrollHandler).toHaveBeenCalledWith(SCROLL_EVENT);
        expect(consumerScrollHandler).not.toHaveBeenCalled();
    });

    it('keeps the configured scroll event throttle when a consumer forces its own', () => {
        expect.hasAssertions();

        const forcedProps = {
            scrollEventThrottle: CONSUMER_SCROLL_EVENT_THROTTLE,
        } as unknown as ScreenChromeScrollViewProps;
        const screen = render(<ScreenChromeScrollView testID="scroll" {...forcedProps} />);

        expect(SCROLL_EVENT_THROTTLE_IS_PACKAGE_OWNED).toBe(true);
        expect(screen.getByTestId('scroll')).toHaveProp(
            'scrollEventThrottle',
            SCREEN_CHROME_DEFAULT_CONFIG.scrollEventThrottle
        );
    });
});

describe('ScreenChromeScrollView additive insets and consumer ref', () => {
    it('stacks consumer padding on the computed insets in additive mode instead of replacing it', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeScrollView
                testID="additive-scroll"
                contentInsetMode="additive"
                contentInsetTop={CONTENT_INSET_TOP}
                contentInsetBottom={CONTENT_INSET_BOTTOM}
                contentContainerStyle={{ paddingTop: CONSUMER_PADDING_TOP }}
            />
        );
        const { contentContainerStyle } = screen.getByTestId('additive-scroll').props;

        expect(StyleSheet.flatten(contentContainerStyle)).toStrictEqual({
            paddingTop: 10 + CONTENT_INSET_TOP + CONSUMER_PADDING_TOP,
            paddingBottom: 30 + CONTENT_INSET_BOTTOM,
        });
    });

    it('keeps replace semantics by default so consumer padding wins over the computed insets', () => {
        expect.hasAssertions();

        const screen = render(
            <ScreenChromeScrollView
                testID="replace-scroll"
                contentInsetTop={CONTENT_INSET_TOP}
                contentContainerStyle={{ paddingTop: CONSUMER_PADDING_TOP }}
            />
        );
        const { contentContainerStyle } = screen.getByTestId('replace-scroll').props;

        expect(StyleSheet.flatten(contentContainerStyle)).toMatchObject({
            paddingTop: CONSUMER_PADDING_TOP,
            paddingLeft: 40,
        });
    });

    it('attaches the scrollable to the chrome ref and a consumer object ref together', () => {
        expect.hasAssertions();

        const consumerRef: { current: ScrollView | null } = { current: null };
        render(<ScreenChromeScrollView testID="ref-scroll" ref={consumerRef} />);

        expect(consumerRef.current).not.toBeNull();
        expect(mockScrollRef).toHaveBeenCalledWith(consumerRef.current);
    });

    it('still attaches the chrome ref when the consumer passes none', () => {
        expect.hasAssertions();

        render(<ScreenChromeScrollView testID="no-ref-scroll" />);

        expect(mockScrollRef).toHaveBeenCalledWith(expect.anything());
    });
});
