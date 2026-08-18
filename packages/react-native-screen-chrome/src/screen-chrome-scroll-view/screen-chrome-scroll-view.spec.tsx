import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { ScreenChromeScrollView } from './screen-chrome-scroll-view';

import type { ScrollView } from 'react-native';

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
        const screen = render(
            <ScreenChromeScrollView
                testID="scroll"
                // @ts-expect-error onScroll is package-owned and omitted from the public props
                onScroll={consumerScrollHandler}
            />
        );
        const scrollView = screen.getByTestId('scroll');

        fireEvent.scroll(scrollView, SCROLL_EVENT);

        expect(mockScrollHandler).toHaveBeenCalledWith(SCROLL_EVENT);
        expect(consumerScrollHandler).not.toHaveBeenCalled();
    });

    it('keeps the configured scroll event throttle when a consumer forces its own', () => {
        expect.hasAssertions();

        const screen = render(
            // @ts-expect-error scrollEventThrottle comes from the provider config, not from the caller
            <ScreenChromeScrollView testID="scroll" scrollEventThrottle={CONSUMER_SCROLL_EVENT_THROTTLE} />
        );

        expect(screen.getByTestId('scroll')).toHaveProp(
            'scrollEventThrottle',
            SCREEN_CHROME_DEFAULT_CONFIG.scrollEventThrottle
        );
    });
});
