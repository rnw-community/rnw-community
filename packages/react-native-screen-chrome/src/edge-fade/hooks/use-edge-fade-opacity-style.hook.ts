import { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

import type { AnimatedStyle } from 'react-native-reanimated';

const OPACITY_OUTPUT_RANGE: readonly [number, number] = [0, 1];
const OPACITY_INPUT_RANGE_FALLBACK: readonly [number, number] = [0, 1];

export const useEdgeFadeOpacityStyle = (
    opacityInputRange: readonly [number, number] | undefined
): AnimatedStyle<{ opacity?: number }> => {
    const { scrollY } = useCollapsibleHeaderScroll();
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
