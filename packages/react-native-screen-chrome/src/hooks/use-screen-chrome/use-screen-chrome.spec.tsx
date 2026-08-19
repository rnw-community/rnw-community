import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../constant/screen-chrome-default-config.constant';
import { ScreenChromeContext } from '../../context/screen-chrome.context';

import { useScreenChrome } from './use-screen-chrome.hook';

import type { ScreenChromeContextValueInterface } from '../../interface/screen-chrome-context-value.interface';
import type { PropsWithChildren } from 'react';

describe('useScreenChrome', () => {
    it('throws without a provider', () => {
        expect.hasAssertions();

        expect(() => renderHook(() => useScreenChrome())).toThrow(
            'useScreenChrome must be used within ScreenChromeProvider'
        );
    });

    it('returns the provided context value', () => {
        expect.hasAssertions();

        const value: ScreenChromeContextValueInterface = {
            colorScheme: 'light',
            config: SCREEN_CHROME_DEFAULT_CONFIG,
        };
        const Wrapper = ({ children }: PropsWithChildren) => (
            <ScreenChromeContext.Provider value={value}>{children}</ScreenChromeContext.Provider>
        );

        const { result } = renderHook(() => useScreenChrome(), { wrapper: Wrapper });

        expect(result.current.config).toBe(SCREEN_CHROME_DEFAULT_CONFIG);
        expect(result.current.colorScheme).toBe('light');
    });
});
