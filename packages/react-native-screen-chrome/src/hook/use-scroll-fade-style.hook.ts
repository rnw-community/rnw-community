import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useScreenChrome } from './use-screen-chrome.hook.js';

/**
 * Creates a clamped opacity style driven by the provider-owned scroll offset.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescrollfadestyle
 */
export const useScrollFadeStyle = (inputRange: readonly [number, number], outputRange: readonly [number, number]) => {
    const { scrollY } = useScreenChrome();

    return useAnimatedStyle(() => ({
        opacity: interpolate(scrollY.get(), inputRange, outputRange, Extrapolation.CLAMP),
    }));
};
