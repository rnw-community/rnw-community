import { buildBackgroundImage } from '../build-background-image/build-background-image.util';
import { getEdgeFadeBackdropFilter } from '../edge-fade-get-backdrop-filter/edge-fade-get-backdrop-filter.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { ScreenChromeColorScheme } from '../../../type/screen-chrome-color-scheme.type';
import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { ScreenChromeMaskStopInterface } from '../../screen-chrome-mask-stop.interface';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

const PERCENT_MULTIPLIER = 100;

const buildMaskImage = (maskStops: Readonly<Record<number, ScreenChromeMaskStopInterface>>): string => {
    const stopsCss = Object.entries(maskStops)
        .sort(([firstOffset], [secondOffset]) => Number(firstOffset) - Number(secondOffset))
        .map(([offset, { color }]) => `${color} ${Number(offset) * PERCENT_MULTIPLIER}%`)
        .join(', ');

    return `linear-gradient(to bottom, ${stopsCss})`;
};

export const getWebEdgeFadeVisualStyle = (
    position: EdgeFadePosition,
    colorScheme: ScreenChromeColorScheme,
    config: ScreenChromeConfigInterface,
    intensity: number
): WebEdgeFadeStyleInterface => {
    const backdropFilter = getEdgeFadeBackdropFilter(intensity);
    const maskImage = buildMaskImage(config.maskStops[position]);

    return {
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
        maskImage,
        WebkitMaskImage: maskImage,
        backgroundImage: buildBackgroundImage(config.colors[colorScheme], position),
    };
};
