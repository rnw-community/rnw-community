import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { makeMutable } from 'react-native-reanimated';

import { ScreenChromeProvider } from '../../screen-chrome-provider/screen-chrome-provider';

import { useScrollInterpolation } from './use-scroll-interpolation.hook';

import type { ReactNode } from 'react';

const INPUT_RANGE: readonly [number, number] = [0, 80];
const PROGRESS_RANGE: readonly [number, number] = [0, 1];
const MAX_TRANSLATE_Y = -40;
const TRANSLATE_RANGE: readonly [number, number] = [0, MAX_TRANSLATE_Y];

const renderInterpolation = (scrollOffset: number, outputRange: readonly [number, number]) => {
    const scrollY = makeMutable(scrollOffset);

    return renderHook(() => useScrollInterpolation(INPUT_RANGE, outputRange), {
        wrapper: ({ children }: { readonly children: ReactNode }) => (
            <ScreenChromeProvider scrollY={scrollY}>{children}</ScreenChromeProvider>
        ),
    });
};

describe('useScrollInterpolation', () => {
    it.each([
        [-20, 0],
        [40, 0.5],
        [200, 1],
    ])('clamps scroll offset %s to normalized progress %s', (scrollOffset, expectedProgress) => {
        expect.hasAssertions();

        const { result } = renderInterpolation(scrollOffset, PROGRESS_RANGE);

        expect(result.current.get()).toBe(expectedProgress);
    });

    it('maps the scroll offset onto an arbitrary output range', () => {
        expect.hasAssertions();

        const { result } = renderInterpolation(20, TRANSLATE_RANGE);

        expect(result.current.get()).toBe(-10);
    });

    it('reads the provider-owned scroll offset when no external one is supplied', () => {
        expect.hasAssertions();

        const { result } = renderHook(() => useScrollInterpolation(INPUT_RANGE, PROGRESS_RANGE), {
            wrapper: ({ children }: { readonly children: ReactNode }) => (
                <ScreenChromeProvider>{children}</ScreenChromeProvider>
            ),
        });

        expect(result.current.get()).toBe(0);
    });
});
