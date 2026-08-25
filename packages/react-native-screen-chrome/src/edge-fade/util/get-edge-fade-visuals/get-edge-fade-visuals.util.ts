import { getBlurTint } from '../get-blur-tint/get-blur-tint.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { EdgeFadePosition } from '../../edge-fade-position.type';

export const getEdgeFadeVisuals = (
    position: EdgeFadePosition,
    colorScheme: ScreenChromeColorScheme,
    config: ScreenChromeConfigInterface,
    isIos: boolean
) => {
    const colorSet = config.colors[colorScheme];
    const washColors: readonly [string, string] =
        position === 'top' ? [colorSet.solid, colorSet.wash] : [colorSet.wash, colorSet.solid];

    return {
        washColors,
        tint: getBlurTint(colorScheme, isIos),
    };
};
