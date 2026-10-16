import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import { useScreenChromeScrollY } from '../../hooks/use-screen-chrome-scroll-y/use-screen-chrome-scroll-y.hook';

import type { AnimatedStyle } from 'react-native-reanimated';

const OPACITY_OUTPUT_RANGE: readonly [number, number] = [0, 1];
const OPACITY_INPUT_RANGE_FALLBACK: readonly [number, number] = [0, 1];

export const useEdgeFadeOpacityStyle = (
    opacityInputRange: readonly [number, number] | undefined
): AnimatedStyle<{ opacity?: number }> => {
    const scrollY = useScreenChromeScrollY();
    const hasOpacityRange = isDefined(opacityInputRange);
    const resolvedOpacityRange = hasOpacityRange ? opacityInputRange : OPACITY_INPUT_RANGE_FALLBACK;

    return useAnimatedStyle(() => {
        if (!hasOpacityRange) {
            return {};
        }

        return {
            opacity: interpolate(scrollY.get(), resolvedOpacityRange, OPACITY_OUTPUT_RANGE, Extrapolation.CLAMP),
        };
    });
};
