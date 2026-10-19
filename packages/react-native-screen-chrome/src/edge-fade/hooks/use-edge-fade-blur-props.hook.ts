import { Extrapolation, interpolate, useAnimatedProps } from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import { useScreenChromeScrollY } from '../../hooks/use-screen-chrome-scroll-y/use-screen-chrome-scroll-y.hook';

export const useEdgeFadeBlurProps = (
    intensityInputRange: readonly [number, number] | undefined,
    maxIntensity: number,
    resolvedIntensity: number
): Partial<{ intensity: number }> => {
    const scrollY = useScreenChromeScrollY();
    const hasIntensityRange = isDefined(intensityInputRange);

    return useAnimatedProps<{ intensity: number }>(() => ({
        intensity: hasIntensityRange
            ? interpolate(scrollY.get(), intensityInputRange, [0, maxIntensity], Extrapolation.CLAMP)
            : resolvedIntensity,
    }));
};
