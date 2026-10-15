import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BottomChromeHeightContext } from '../../context/bottom-chrome-height.context';

import { useBottomChromeInset } from './use-bottom-chrome-inset.hook';

import type { ReactNode } from 'react';
import type { Metrics } from 'react-native-safe-area-context';

const INSETS: Metrics = {
    insets: { top: 59, bottom: 34, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 390, height: 844 },
};
const CHROME_HEIGHT = 64;

const SafeArea = ({ children }: { readonly children: ReactNode }): ReactNode => (
    <SafeAreaProvider initialMetrics={INSETS}>{children}</SafeAreaProvider>
);

describe('useBottomChromeInset', () => {
    it('falls back to the safe-area bottom inset when no bottom chrome is published', () => {
        expect.hasAssertions();

        const { result } = renderHook(() => useBottomChromeInset(), { wrapper: SafeArea });

        expect(result.current).toStrictEqual({ chromeHeight: 0, inset: INSETS.insets.bottom });
    });

    it('adds the safe-area bottom inset to the published bottom chrome height', () => {
        expect.hasAssertions();

        const wrapper = ({ children }: { readonly children: ReactNode }): ReactNode => (
            <SafeArea>
                <BottomChromeHeightContext.Provider value={CHROME_HEIGHT}>{children}</BottomChromeHeightContext.Provider>
            </SafeArea>
        );
        const { result } = renderHook(() => useBottomChromeInset(), { wrapper });

        expect(result.current).toStrictEqual({
            chromeHeight: CHROME_HEIGHT,
            inset: CHROME_HEIGHT + INSETS.insets.bottom,
        });
    });
});
