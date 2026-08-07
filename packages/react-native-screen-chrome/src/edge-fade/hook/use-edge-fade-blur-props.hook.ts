import { Extrapolation, interpolate, useAnimatedProps } from 'react-native-reanimated';

import { isDefined } from '@rnw-community/shared';

import { useScreenChrome } from '../../hook/use-screen-chrome.hook.js';

const INTENSITY_INPUT_RANGE_FALLBACK: readonly [number, number] = [0, 1];

export const useEdgeFadeBlurProps = (
    intensityInputRange: readonly [number, number] | undefined,
    maxIntensity: number,
    resolvedIntensity: number
) => {
    const { scrollY } = useScreenChrome();
    const hasIntensityRange = isDefined(intensityInputRange);
    const resolvedIntensityRange = hasIntensityRange ? intensityInputRange : INTENSITY_INPUT_RANGE_FALLBACK;

    return useAnimatedProps<{ intensity: number | undefined }>(() => ({
        intensity: hasIntensityRange
            ? interpolate(scrollY.get(), resolvedIntensityRange, [0, maxIntensity], Extrapolation.CLAMP)
            : resolvedIntensity,
    }));
};
