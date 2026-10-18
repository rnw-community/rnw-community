import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant';
import { ScreenChromeProvider } from '../screen-chrome-provider/screen-chrome-provider';

import { ScreenChromeHeader } from './screen-chrome-header';

import type { Metrics } from 'react-native-safe-area-context';

const INSETS: Metrics = {
    insets: { top: 59, bottom: 34, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 390, height: 844 },
};
const EXTRA_TOP_INSET = 10;
const TITLE = 'Static header title';

const renderHeader = (ui: React.ReactElement) =>
    render(
        <SafeAreaProvider initialMetrics={INSETS}>
            <ScreenChromeProvider>{ui}</ScreenChromeProvider>
        </SafeAreaProvider>
    );

describe('ScreenChromeHeader', () => {
    it('renders its content', () => {
        expect.hasAssertions();

        const { getByText } = renderHeader(
            <ScreenChromeHeader>
                <Text>{TITLE}</Text>
            </ScreenChromeHeader>
        );

        expect(getByText(TITLE)).toBeDefined();
    });

    it('pads the device top inset and pins the row to the configured height', () => {
        expect.hasAssertions();

        const screen = renderHeader(
            <ScreenChromeHeader testID="static-header">
                <Text>{TITLE}</Text>
            </ScreenChromeHeader>
        );

        expect(screen.getByTestId('static-header')).toHaveProp('pointerEvents', 'box-none');
        expect(screen.getByTestId('static-header')).toHaveStyle({ paddingTop: INSETS.insets.top, zIndex: 3 });

        expect(screen.getByTestId('static-header-row')).toHaveStyle({
            height: SCREEN_CHROME_DEFAULT_CONFIG.headerHeight,
            overflow: 'hidden',
        });
    });

    it('adds the explicit top inset on top of the safe area', () => {
        expect.hasAssertions();

        const { getByTestId } = renderHeader(
            <ScreenChromeHeader testID="static-header" topInset={EXTRA_TOP_INSET}>
                <Text>{TITLE}</Text>
            </ScreenChromeHeader>
        );

        expect(getByTestId('static-header')).toHaveStyle({ paddingTop: INSETS.insets.top + EXTRA_TOP_INSET });
    });

    it('keeps consumer styles after generated padding so explicit values win', () => {
        expect.hasAssertions();

        const { getByTestId } = renderHeader(
            <ScreenChromeHeader testID="static-header" style={{ paddingTop: 99 }}>
                <Text>{TITLE}</Text>
            </ScreenChromeHeader>
        );

        expect(getByTestId('static-header')).toHaveStyle({ paddingTop: 99 });
    });

    it('forwards view props to the container and merges the row style after the row defaults', () => {
        expect.hasAssertions();

        const { getByTestId } = renderHeader(
            <ScreenChromeHeader testID="static-header" accessibilityRole="header" rowStyle={{ paddingHorizontal: 4 }}>
                <Text>{TITLE}</Text>
            </ScreenChromeHeader>
        );

        expect(getByTestId('static-header')).toHaveProp('accessibilityRole', 'header');
        expect(getByTestId('static-header-row')).toHaveStyle({
            height: SCREEN_CHROME_DEFAULT_CONFIG.headerHeight,
            paddingHorizontal: 4,
        });
    });
});
