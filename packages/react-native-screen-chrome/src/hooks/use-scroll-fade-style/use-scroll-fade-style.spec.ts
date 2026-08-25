import { describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import { useScrollFadeStyle } from './use-scroll-fade-style.hook';

const mockScrollY = { get: jest.fn(() => 0) };

const invokeUpdater = <Result>(updater: () => Result): Result => updater();

jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');

    return { ...actual, useAnimatedStyle: jest.fn(invokeUpdater) };
});
jest.mock('@rnw-community/react-native-collapsible-header', () => ({
    useCollapsibleHeaderScroll: () => ({ scrollY: mockScrollY }),
}));

describe('useScrollFadeStyle', () => {
    it.each([
        [-10, 1],
        [15, 0.5],
        [40, 0],
    ])('clamps scroll offset %s to opacity %s', (scrollOffset, expectedOpacity) => {
        expect.hasAssertions();

        mockScrollY.get.mockReturnValue(scrollOffset);

        const { result } = renderHook(() => useScrollFadeStyle([10, 20], [1, 0]));

        expect(result.current).toEqual({ opacity: expectedOpacity });
    });
});
