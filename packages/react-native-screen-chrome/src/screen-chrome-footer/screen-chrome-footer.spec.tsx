import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomChromeInsetProvider } from '../bottom-chrome-inset-provider/bottom-chrome-inset-provider';
import { useBottomChromeInset } from '../hooks/use-bottom-chrome-inset/use-bottom-chrome-inset.hook';
import { ScreenChromeProvider } from '../screen-chrome-provider/screen-chrome-provider';

import { ScreenChromeFooter } from './screen-chrome-footer';

import type { ReactElement, ReactNode } from 'react';
import type { MeasureOnSuccessCallback } from 'react-native';
import type { Metrics } from 'react-native-safe-area-context';

interface MeasurableInterface {
    measure: (callback: MeasureOnSuccessCallback) => void;
}

jest.mock('expo-blur', () => ({ BlurView: jest.fn(() => null) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: jest.fn(() => null) }));
jest.mock('@react-native-masked-view/masked-view', () => ({ __esModule: true, default: jest.fn(() => null) }));

const INSETS: Metrics = {
    insets: { top: 59, bottom: 34, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 390, height: 844 },
};
const MEASURED_HEIGHT = 72;
const UPDATED_HEIGHT = 120;
const TAB_BAR_HEIGHT = 68;

const InsetProbe = (): ReactNode => {
    const { chromeHeight, inset } = useBottomChromeInset();

    return <Text testID="inset-probe">{`${chromeHeight}/${inset}`}</Text>;
};

const renderInChrome = (ui: ReactElement) =>
    render(
        <SafeAreaProvider initialMetrics={INSETS}>
            <ScreenChromeProvider>{ui}</ScreenChromeProvider>
        </SafeAreaProvider>
    );

const layoutEvent = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: INSETS.frame.width, height } } });

afterEach(() => {
    jest.restoreAllMocks();
});

describe('ScreenChromeFooter', () => {
    it('pins a box-none container to the bottom edge padded by the safe area', () => {
        expect.hasAssertions();

        const screen = renderInChrome(
            <ScreenChromeFooter testID="footer" accessibilityLabel="Totals">
                <Text>Total</Text>
            </ScreenChromeFooter>
        );

        expect(screen.getByText('Total')).toBeDefined();
        expect(screen.getByTestId('footer')).toHaveProp('pointerEvents', 'box-none');
        expect(screen.getByTestId('footer')).toHaveProp('accessibilityLabel', 'Totals');
        expect(screen.getByTestId('footer')).toHaveStyle({
            bottom: 0,
            paddingBottom: INSETS.insets.bottom,
            position: 'absolute',
            zIndex: 3,
        });
        expect(screen.getByTestId('footer-content')).toHaveProp('collapsable', false);
    });

    it('merges consumer container and content styles after the defaults', () => {
        expect.hasAssertions();

        const screen = renderInChrome(
            <ScreenChromeFooter contentStyle={{ alignSelf: 'center', maxWidth: 600 }} style={{ zIndex: 10 }} testID="footer">
                <Text>Total</Text>
            </ScreenChromeFooter>
        );

        expect(screen.getByTestId('footer')).toHaveStyle({ zIndex: 10 });
        expect(screen.getByTestId('footer-content')).toHaveStyle({ alignSelf: 'center', maxWidth: 600, zIndex: 3 });
    });

    it('renders the bottom edge fade behind the content with forwarded props', () => {
        expect.hasAssertions();

        const screen = renderInChrome(
            <ScreenChromeFooter edgeFadeProps={{ height: 96, testID: 'footer-fade' }}>
                <Text>Total</Text>
            </ScreenChromeFooter>
        );

        expect(screen.getByTestId('footer-fade', { includeHiddenElements: true })).toHaveStyle({
            height: 96 + INSETS.insets.bottom,
            zIndex: 2,
        });
        expect(screen.queryByTestId('undefined-content')).toBeNull();
    });
});

describe('ScreenChromeFooter bottom chrome inset publication', () => {
    it('publishes the measured content height to the bottom chrome inset on layout', () => {
        expect.hasAssertions();

        const screen = renderInChrome(
            <BottomChromeInsetProvider>
                <InsetProbe />
                <ScreenChromeFooter testID="footer">
                    <Text>Total</Text>
                </ScreenChromeFooter>
            </BottomChromeInsetProvider>
        );

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`0/${INSETS.insets.bottom}`);

        fireEvent(screen.getByTestId('footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${MEASURED_HEIGHT}/${MEASURED_HEIGHT + INSETS.insets.bottom}`
        );

        fireEvent(screen.getByTestId('footer-content'), 'layout', layoutEvent(UPDATED_HEIGHT));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${UPDATED_HEIGHT}/${UPDATED_HEIGHT + INSETS.insets.bottom}`
        );
    });

    it('publishes a synchronous mount measurement before the first layout event', () => {
        expect.hasAssertions();

        jest.spyOn(View.prototype as MeasurableInterface, 'measure').mockImplementation(callback => {
            callback(0, 0, INSETS.frame.width, MEASURED_HEIGHT, 0, 0);
        });

        const screen = renderInChrome(
            <BottomChromeInsetProvider>
                <InsetProbe />
                <ScreenChromeFooter>
                    <Text>Total</Text>
                </ScreenChromeFooter>
            </BottomChromeInsetProvider>
        );

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${MEASURED_HEIGHT}/${MEASURED_HEIGHT + INSETS.insets.bottom}`
        );
    });

    it('withdraws its height from the inset when it unmounts', () => {
        expect.hasAssertions();

        const Screen = ({ withFooter }: { readonly withFooter: boolean }): ReactNode => (
            <BottomChromeInsetProvider>
                <InsetProbe />
                {withFooter ? (
                    <ScreenChromeFooter testID="footer">
                        <Text>Total</Text>
                    </ScreenChromeFooter>
                ) : null}
            </BottomChromeInsetProvider>
        );
        const screen = renderInChrome(<Screen withFooter />);

        fireEvent(screen.getByTestId('footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));

        act(() => {
            screen.rerender(
                <SafeAreaProvider initialMetrics={INSETS}>
                    <ScreenChromeProvider>
                        <Screen withFooter={false} />
                    </ScreenChromeProvider>
                </SafeAreaProvider>
            );
        });

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`0/${INSETS.insets.bottom}`);
    });

    it('renders and accepts layout events without a bottom chrome inset provider', () => {
        expect.hasAssertions();

        const screen = renderInChrome(
            <ScreenChromeFooter testID="footer">
                <Text>Total</Text>
            </ScreenChromeFooter>
        );

        expect(() => {
            fireEvent(screen.getByTestId('footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));
        }).not.toThrow();
    });
});

describe('ScreenChromeFooter with several footers under one provider', () => {
    const TwoFooters = ({ withTallFooter }: { readonly withTallFooter: boolean }): ReactNode => (
        <BottomChromeInsetProvider>
            <InsetProbe />
            <ScreenChromeFooter testID="short-footer">
                <Text>Short</Text>
            </ScreenChromeFooter>
            {withTallFooter ? (
                <ScreenChromeFooter testID="tall-footer">
                    <Text>Tall</Text>
                </ScreenChromeFooter>
            ) : null}
        </BottomChromeInsetProvider>
    );
    const wrapInChrome = (ui: ReactElement): ReactElement => (
        <SafeAreaProvider initialMetrics={INSETS}>
            <ScreenChromeProvider>{ui}</ScreenChromeProvider>
        </SafeAreaProvider>
    );

    it('publishes the tallest footer height because bottom-anchored footers overlap', () => {
        expect.hasAssertions();

        const screen = render(wrapInChrome(<TwoFooters withTallFooter />));

        fireEvent(screen.getByTestId('short-footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));
        fireEvent(screen.getByTestId('tall-footer-content'), 'layout', layoutEvent(UPDATED_HEIGHT));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${UPDATED_HEIGHT}/${UPDATED_HEIGHT + INSETS.insets.bottom}`
        );

        fireEvent(screen.getByTestId('tall-footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT - 1));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${MEASURED_HEIGHT}/${MEASURED_HEIGHT + INSETS.insets.bottom}`
        );
    });

    it('keeps the remaining footer height when another footer unmounts', () => {
        expect.hasAssertions();

        const screen = render(wrapInChrome(<TwoFooters withTallFooter />));

        fireEvent(screen.getByTestId('short-footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));
        fireEvent(screen.getByTestId('tall-footer-content'), 'layout', layoutEvent(UPDATED_HEIGHT));

        act(() => {
            screen.rerender(wrapInChrome(<TwoFooters withTallFooter={false} />));
        });

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${MEASURED_HEIGHT}/${MEASURED_HEIGHT + INSETS.insets.bottom}`
        );
    });
});

describe('ScreenChromeFooter stacked above other bottom chrome', () => {
    it('stacks above other bottom chrome without the safe-area padding and publishes the combined footprint', () => {
        expect.hasAssertions();

        const tabBarFootprint = TAB_BAR_HEIGHT + INSETS.insets.bottom;
        const screen = renderInChrome(
            <BottomChromeInsetProvider>
                <InsetProbe />
                <ScreenChromeFooter bottomOffset={tabBarFootprint} includeBottomSafeArea={false} testID="footer">
                    <Text>Search</Text>
                </ScreenChromeFooter>
            </BottomChromeInsetProvider>
        );

        expect(screen.getByTestId('footer')).toHaveStyle({ bottom: tabBarFootprint, paddingBottom: 0 });

        fireEvent(screen.getByTestId('footer-content'), 'layout', layoutEvent(MEASURED_HEIGHT));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(
            `${MEASURED_HEIGHT + TAB_BAR_HEIGHT}/${MEASURED_HEIGHT + tabBarFootprint}`
        );
    });
});
