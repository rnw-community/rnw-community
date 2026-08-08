import { isDefined } from '@rnw-community/shared';

import { getEdgeFadeMaskStops } from '../edge-fade-get-mask-stops.util.js';
import { getBlurTint } from '../get-blur-tint.util.js';

import type { ColorSchemeEnum } from '../../../enum/color-scheme.enum.js';
import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface.js';
import type { EdgeFadePosition } from '../../../type/edge-fade-position.type.js';

const toGradientTuple = <T>(items: readonly T[]): readonly [T, T, ...T[]] => {
    const [first, second, ...remaining] = items;

    if (!isDefined(first) || !isDefined(second)) {
        throw new TypeError('EdgeFade gradients require at least two stops');
    }

    return [first, second, ...remaining];
};

export const getEdgeFadeVisuals = (
    position: EdgeFadePosition,
    colorScheme: ColorSchemeEnum,
    config: ScreenChromeConfigInterface,
    isIos: boolean
) => {
    const colorSet = config.colors[colorScheme];
    const washColors =
        position === 'top'
            ? toGradientTuple([colorSet.solid, colorSet.wash])
            : toGradientTuple([colorSet.wash, colorSet.solid]);
    const maskGradient = getEdgeFadeMaskStops(config.maskStops, position);

    return {
        washColors,
        maskColors: toGradientTuple(maskGradient.colors),
        maskLocations: toGradientTuple(maskGradient.locations),
        tint: getBlurTint(colorScheme, isIos),
    };
};
