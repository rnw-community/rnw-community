import { describe, expect, it, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react-native';

import { useCollapsibleHeaderAnimatedLayers } from './use-collapsible-header-animated-layers.hook';

import type { CollapsibleHeaderMotionConfig } from '../../interface/collapsible-header-motion-config.interface';
import type { SharedValue } from 'react-native-reanimated';

const invokeUpdater = <Result>(updater: () => Result): Result => updater();

jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');

    return {
        ...actual,
        useAnimatedProps: jest.fn(invokeUpdater),
        useAnimatedStyle: jest.fn(invokeUpdater),
        useDerivedValue: jest.fn((updater: () => number) => ({ get: updater })),
    };
});

const EXPANDED_HEIGHT = 156;
const COLLAPSED_HEIGHT = 40;
const COLLAPSE_START = 20;
const COLLAPSE_DISTANCE = 80;
const COLLAPSE_MIDPOINT = 60;
const COLLAPSE_END = 100;
const INTERMEDIATE_HEIGHT = 98;
const OVERSCROLL_OFFSET = -20;
const STRETCHED_HEIGHT = EXPANDED_HEIGHT - OVERSCROLL_OFFSET;
const MOTION_CONFIG: CollapsibleHeaderMotionConfig = {
    expandedOpacityEndProgress: 0.75,
    collapsedOpacityStartProgress: 0.5,
    backgroundOpacityStartProgress: 0.25,
    pointerEventsSwitchProgress: 0.6,
    expandedTranslateY: 0,
    expandedScale: 1,
    collapsedTranslateY: 0,
};

const createSharedValue = (initialValue: number): SharedValue<number> => {
    let currentValue = initialValue;

    return {
        get value() {
            return currentValue;
        },
        set value(value: number) {
            currentValue = value;
        },
        get: () => currentValue,
        set: (value: number | ((currentValue: number) => number)) => {
            currentValue = typeof value === 'function' ? value(currentValue) : value;
        },
        addListener: jest.fn(),
        removeListener: jest.fn(),
        modify: (modifier?: (value: number) => number) => {
            if (modifier !== undefined) {
                currentValue = modifier(currentValue);
            }
        },
    };
};

const renderSubject = (scrollY: SharedValue<number>, stretchOnOverscroll = false) =>
    renderHook(() =>
        useCollapsibleHeaderAnimatedLayers({
            scrollY,
            expandedHeight: EXPANDED_HEIGHT,
            collapsedHeight: COLLAPSED_HEIGHT,
            collapseStart: COLLAPSE_START,
            collapseDistance: COLLAPSE_DISTANCE,
            motionConfig: MOTION_CONFIG,
            stretchOnOverscroll,
        })
    );

describe('useCollapsibleHeaderAnimatedLayers', () => {
    it('reads caller-owned scroll updates without remounting', () => {
        expect.hasAssertions();
        const scrollY = createSharedValue(COLLAPSE_START);
        const { result, rerender } = renderSubject(scrollY);

        expect(result.current.progress.get()).toBe(0);
        expect(result.current.headerAnimatedStyle).toEqual({ height: EXPANDED_HEIGHT });
        expect(result.current.expandedAnimatedStyle).toMatchObject({ opacity: 1, pointerEvents: 'auto' });
        expect(result.current.collapsedAnimatedStyle).toMatchObject({ opacity: 0, pointerEvents: 'none' });
        expect(result.current.expandedAnimatedProps).toEqual({
            accessibilityElementsHidden: false,
            importantForAccessibility: 'auto',
        });
        expect(result.current.collapsedAnimatedProps).toEqual({
            accessibilityElementsHidden: true,
            importantForAccessibility: 'no-hide-descendants',
        });

        act(() => {
            scrollY.set(COLLAPSE_MIDPOINT);
        });
        rerender(undefined);

        expect(result.current.progress.get()).toBeCloseTo(0.5);
        expect(result.current.headerAnimatedStyle).toEqual({ height: INTERMEDIATE_HEIGHT });
        expect(result.current.expandedAnimatedStyle).toEqual(expect.objectContaining({ opacity: expect.closeTo(1 / 3) }));
        expect(result.current.collapsedAnimatedStyle).toMatchObject({ opacity: 0, pointerEvents: 'none' });
        expect(result.current.expandedAnimatedProps).toMatchObject({ accessibilityElementsHidden: false });

        act(() => {
            scrollY.set(COLLAPSE_END);
        });
        rerender(undefined);

        expect(result.current.progress.get()).toBe(1);
        expect(result.current.headerAnimatedStyle).toEqual({ height: COLLAPSED_HEIGHT });
        expect(result.current.expandedAnimatedStyle).toMatchObject({ opacity: 0, pointerEvents: 'none' });
        expect(result.current.collapsedAnimatedStyle).toMatchObject({ opacity: 1, pointerEvents: 'auto' });
        expect(result.current.expandedAnimatedProps).toMatchObject({ accessibilityElementsHidden: true });
        expect(result.current.collapsedAnimatedProps).toMatchObject({ accessibilityElementsHidden: false });
    });

    it('stretches the header height only while overscroll stretching is enabled', () => {
        expect.hasAssertions();
        const scrollY = createSharedValue(OVERSCROLL_OFFSET);

        expect(renderSubject(scrollY).result.current.headerAnimatedStyle).toEqual({ height: EXPANDED_HEIGHT });
        expect(renderSubject(scrollY, true).result.current.headerAnimatedStyle).toEqual({ height: STRETCHED_HEIGHT });
    });
});
