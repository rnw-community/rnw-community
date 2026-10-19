import { useAnimatedStyle } from 'react-native-reanimated';

import { useScrollInterpolation } from '../use-scroll-interpolation/use-scroll-interpolation.hook';

import type { AnimatedStyle } from 'react-native-reanimated';

/**
 * Creates a clamped opacity style driven by the chrome scroll offset.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescrollfadestyle
 */
export const useScrollFadeStyle = (
    inputRange: readonly [number, number],
    outputRange: readonly [number, number]
): AnimatedStyle<{ opacity: number }> => {
    const opacity = useScrollInterpolation(inputRange, outputRange);

    return useAnimatedStyle(() => ({ opacity: opacity.get() }));
};
