import { easeGradient } from 'react-native-easing-gradient';

import { isDefined } from '@rnw-community/shared';

import { getBlurTint } from '../get-blur-tint/get-blur-tint.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

const toGradientTuple = <T>(items: readonly T[]): readonly [T, T, ...T[]] => {
    const [first, second, ...remaining] = items;

    if (!isDefined(first) || !isDefined(second)) {
        throw new TypeError('EdgeFade gradients require at least two stops');
    }

    return [first, second, ...remaining];
};

export const getEdgeFadeVisuals = (
    position: EdgeFadePosition,
    colorScheme: ScreenChromeColorScheme,
    config: ScreenChromeConfigInterface,
    isIos: boolean
) => {
    const colorSet = config.colors[colorScheme];
    const washColors: readonly [string, string] =
        position === 'top' ? [colorSet.solid, colorSet.wash] : [colorSet.wash, colorSet.solid];
    const maskGradient = easeGradient({ colorStops: config.maskStops[position] });

    return {
        washColors,
        maskColors: toGradientTuple(maskGradient.colors),
        maskLocations: toGradientTuple(maskGradient.locations),
        tint: getBlurTint(colorScheme, isIos),
    };
};
