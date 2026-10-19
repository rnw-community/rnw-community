import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated';

import { useScreenChromeScrollY } from '../use-screen-chrome-scroll-y/use-screen-chrome-scroll-y.hook';

import type { DerivedValue } from 'react-native-reanimated';

/**
 * Derives a clamped value from the chrome scroll offset so one driver can feed any number of animated styles.
 * @see https://github.com/rnw-community/rnw-community/tree/master/packages/react-native-screen-chrome#usescrollinterpolation
 */
export const useScrollInterpolation = (
    inputRange: readonly [number, number],
    outputRange: readonly [number, number]
): DerivedValue<number> => {
    const scrollY = useScreenChromeScrollY();

    return useDerivedValue(() => interpolate(scrollY.get(), inputRange, outputRange, Extrapolation.CLAMP));
};
