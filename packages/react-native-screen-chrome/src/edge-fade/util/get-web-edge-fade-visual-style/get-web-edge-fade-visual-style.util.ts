import { buildBackgroundImage } from '../build-background-image/build-background-image.util';
import { buildMaskImage } from '../build-mask-image/build-mask-image.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

export const getWebEdgeFadeVisualStyle = (
    position: EdgeFadePosition,
    colorScheme: ScreenChromeColorScheme,
    config: ScreenChromeConfigInterface
): WebEdgeFadeStyleInterface => {
    const maskImage = buildMaskImage(config.maskStops[position]);

    return {
        maskImage,
        WebkitMaskImage: maskImage,
        backgroundImage: buildBackgroundImage(config.colors[colorScheme], position),
    };
};
