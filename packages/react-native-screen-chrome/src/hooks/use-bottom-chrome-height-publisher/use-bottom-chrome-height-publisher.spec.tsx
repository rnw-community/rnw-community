import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';

import { isDefined } from '@rnw-community/shared';

import { BottomChromeInsetProvider } from '../../bottom-chrome-inset-provider/bottom-chrome-inset-provider';
import { useBottomChromeInset } from '../use-bottom-chrome-inset/use-bottom-chrome-inset.hook';

import { useBottomChromeHeightPublisher } from './use-bottom-chrome-height-publisher.hook';

import type { ReactElement, ReactNode } from 'react';

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

const TAB_BAR_HEIGHT = 68;
const MEASURED_HEIGHT = 72;
const SCREEN_WIDTH = 390;

const InsetProbe = (): ReactNode => <Text testID="inset-probe">{useBottomChromeInset().chromeHeight}</Text>;

const MeasuredChrome = (): ReactNode => <View testID="measured" collapsable={false} {...useBottomChromeHeightPublisher()} />;

const DeclaredChrome = ({ height, visible }: { readonly height?: number; readonly visible: boolean }): ReactNode => {
    const { ref, onLayout } = useBottomChromeHeightPublisher({ height });

    return visible ? <View testID="declared" ref={ref} onLayout={onLayout} /> : null;
};

const layoutEvent = (height: number) => ({ nativeEvent: { layout: { x: 0, y: 0, width: SCREEN_WIDTH, height } } });

afterEach(() => {
    jest.restoreAllMocks();
});

describe('useBottomChromeHeightPublisher', () => {
    it('publishes the height measured on mount and on every layout of the node it is spread on', () => {
        expect.hasAssertions();

        jest.spyOn(View.prototype, 'measure').mockImplementation(callback => {
            callback(0, 0, SCREEN_WIDTH, MEASURED_HEIGHT, 0, 0);
        });

        const screen = render(
            <BottomChromeInsetProvider>
                <InsetProbe />
                <MeasuredChrome />
            </BottomChromeInsetProvider>
        );

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`${MEASURED_HEIGHT}`);

        fireEvent(screen.getByTestId('measured'), 'layout', layoutEvent(TAB_BAR_HEIGHT));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`${TAB_BAR_HEIGHT}`);
    });

    it('reserves a declared height that layout events and hidden chrome do not change', () => {
        expect.hasAssertions();

        const renderScreen = (visible: boolean): ReactElement => (
            <BottomChromeInsetProvider>
                <InsetProbe />
                <DeclaredChrome height={TAB_BAR_HEIGHT} visible={visible} />
            </BottomChromeInsetProvider>
        );
        const screen = render(renderScreen(true));

        fireEvent(screen.getByTestId('declared'), 'layout', layoutEvent(0));

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`${TAB_BAR_HEIGHT}`);

        act(() => {
            screen.rerender(renderScreen(false));
        });

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`${TAB_BAR_HEIGHT}`);
    });

    it('republishes a changed declared height and withdraws it on unmount', () => {
        expect.hasAssertions();

        const renderScreen = (height?: number): ReactElement => (
            <BottomChromeInsetProvider>
                <InsetProbe />
                {isDefined(height) ? <DeclaredChrome height={height} visible /> : null}
            </BottomChromeInsetProvider>
        );
        const screen = render(renderScreen(TAB_BAR_HEIGHT));

        act(() => {
            screen.rerender(renderScreen(MEASURED_HEIGHT));
        });

        expect(screen.getByTestId('inset-probe')).toHaveTextContent(`${MEASURED_HEIGHT}`);

        act(() => {
            screen.rerender(renderScreen());
        });

        expect(screen.getByTestId('inset-probe')).toHaveTextContent('0');
    });
});
