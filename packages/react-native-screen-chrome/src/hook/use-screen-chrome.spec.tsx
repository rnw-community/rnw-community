import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../constant/screen-chrome-default-config.constant.js';
import { ScreenChromeContext } from '../context/screen-chrome.context.js';
import { ColorSchemeEnum } from '../enum/color-scheme.enum.js';

import { useScreenChrome } from './use-screen-chrome.hook.js';

import type { ScreenChromeContextValueInterface } from '../interface/screen-chrome-context-value.interface.js';
import type { PropsWithChildren } from 'react';
import type Animated from 'react-native-reanimated';

describe('useScreenChrome', () => {
    it('throws without a provider', () => {
        expect(() => renderHook(() => useScreenChrome())).toThrow(
            'useScreenChrome must be used within ScreenChromeProvider'
        );
    });

    it('returns the provided context value', () => {
        const Wrapper = ({ children }: PropsWithChildren) => {
            const scrollY = useSharedValue(0);
            const scrollHandler = useAnimatedScrollHandler(() => {
                'worklet';
            });
            const scrollRef = useAnimatedRef<Animated.ScrollView>();
            const value: ScreenChromeContextValueInterface = {
                colorScheme: ColorSchemeEnum.LIGHT,
                config: SCREEN_CHROME_DEFAULT_CONFIG,
                scrollY,
                scrollHandler,
                scrollRef,
            };

            return <ScreenChromeContext.Provider value={value}>{children}</ScreenChromeContext.Provider>;
        };

        const { result } = renderHook(() => useScreenChrome(), { wrapper: Wrapper });

        expect(result.current.config).toBe(SCREEN_CHROME_DEFAULT_CONFIG);
        expect(result.current.colorScheme).toBe(ColorSchemeEnum.LIGHT);
    });
});
