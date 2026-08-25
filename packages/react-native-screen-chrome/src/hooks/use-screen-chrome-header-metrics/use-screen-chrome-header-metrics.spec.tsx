import { describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';
import { ScreenChromeContext } from '../../context/screen-chrome.context';

import { useScreenChromeHeaderMetrics } from './use-screen-chrome-header-metrics.hook';

import type { ScreenChromeContextValueInterface } from '../../interface/screen-chrome-context-value.interface';
import type { PropsWithChildren } from 'react';

const INSETS_TOP = 59;

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: INSETS_TOP, right: 0, bottom: 0, left: 0 }),
}));

describe('useScreenChromeHeaderMetrics', () => {
    it('derives the header footprint from the live config and device insets', () => {
        expect.hasAssertions();

        const value: ScreenChromeContextValueInterface = {
            colorScheme: 'light',
            config: SCREEN_CHROME_DEFAULT_CONFIG,
        };
        const Wrapper = ({ children }: PropsWithChildren) => (
            <ScreenChromeContext.Provider value={value}>{children}</ScreenChromeContext.Provider>
        );

        const { result } = renderHook(() => useScreenChromeHeaderMetrics(), { wrapper: Wrapper });

        expect(result.current).toBe(INSETS_TOP + SCREEN_CHROME_DEFAULT_CONFIG.headerHeight);
    });
});
