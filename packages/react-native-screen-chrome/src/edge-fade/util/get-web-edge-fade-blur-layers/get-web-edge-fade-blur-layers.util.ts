import { buildMaskImage } from '../build-mask-image/build-mask-image.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

const BLUR_LAYER_COUNT = 4;
const BAND_STEP_PERCENT = 100 / (BLUR_LAYER_COUNT + 1);
const BAND_STOP_STEPS = [0, 1, 2, 3] as const;
const MINIMUM_BLUR_PIXELS = 8;
const INTENSITY_MULTIPLIER = 0.45;
const SATURATION = 1.08;

const buildBandMaskImage = (position: EdgeFadePosition, layerIndex: number): string => {
    const [fadeInStart, solidStart, solidEnd, fadeOutEnd] = BAND_STOP_STEPS.map(
        step => (layerIndex + step) * BAND_STEP_PERCENT
    );

    return `linear-gradient(to ${position}, transparent ${fadeInStart}%, #000 ${solidStart}%, #000 ${solidEnd}%, transparent ${fadeOutEnd}%)`;
};

export const getWebEdgeFadeBlurLayers = (
    position: EdgeFadePosition,
    config: ScreenChromeConfigInterface,
    intensity: number
): readonly WebEdgeFadeStyleInterface[] => {
    const edgeBlurPixels = Math.max(MINIMUM_BLUR_PIXELS, intensity * INTENSITY_MULTIPLIER);
    const edgeMaskImage = buildMaskImage(config.maskStops[position]);

    return Array.from({ length: BLUR_LAYER_COUNT }, (_, layerIndex) => {
        const backdropFilter = `blur(${edgeBlurPixels / 2 ** (BLUR_LAYER_COUNT - 1 - layerIndex)}px) saturate(${SATURATION})`;
        const maskImage = `${buildBandMaskImage(position, layerIndex)}, ${edgeMaskImage}`;

        return {
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            maskImage,
            WebkitMaskImage: maskImage,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
        };
    });
};
