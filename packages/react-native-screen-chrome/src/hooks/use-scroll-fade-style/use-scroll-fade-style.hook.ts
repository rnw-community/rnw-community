import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';

import type { AnimatedStyle } from 'react-native-reanimated';

/**
 * Creates a clamped opacity style driven by the provider-owned scroll offset.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescrollfadestyle
 */
export const useScrollFadeStyle = (
    inputRange: readonly [number, number],
    outputRange: readonly [number, number]
): AnimatedStyle<{ opacity: number }> => {
    const { scrollY } = useCollapsibleHeaderScroll();

    return useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.get(), inputRange, outputRange, Extrapolation.CLAMP),
    }));
};
