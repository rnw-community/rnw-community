import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';

import { ScreenChromeScrollView } from './screen-chrome-scroll-view';

import type { ScrollView } from 'react-native';

const mockScrollHandler = jest.fn();
const mockScrollRef = jest.fn<(instance: ScrollView | null) => void>();
const mockConfig = SCREEN_CHROME_DEFAULT_CONFIG;

jest.mock('../hook/use-screen-chrome.hook', () => ({
    useScreenChrome: () => ({ config: mockConfig, scrollHandler: mockScrollHandler, scrollRef: mockScrollRef }),
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
});
