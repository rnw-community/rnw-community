import { Extrapolation, interpolate, useAnimatedProps } from 'react-native-reanimated';

import { useCollapsibleHeaderScroll } from '@rnw-community/react-native-collapsible-header';
import { isDefined } from '@rnw-community/shared';

export const useEdgeFadeBlurProps = (
    intensityInputRange: readonly [number, number] | undefined,
    maxIntensity: number,
    resolvedIntensity: number
): Partial<{ intensity: number }> => {
    const { scrollY } = useCollapsibleHeaderScroll();
    const hasIntensityRange = isDefined(intensityInputRange);

    return useAnimatedProps<{ intensity: number }>(() => ({
        intensity: hasIntensityRange
            ? interpolate(scrollY.get(), intensityInputRange, [0, maxIntensity], Extrapolation.CLAMP)
            : resolvedIntensity,
    }));
};
