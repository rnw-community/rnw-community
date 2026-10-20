import { buildMaskImage } from '../build-mask-image/build-mask-image.util';

import type { ScreenChromeConfigInterface } from '../../../interface/screen-chrome-config.interface';
import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

const BLUR_SLICE_COUNT = 4;
const BLUR_SLICE_PERCENT = 100 / BLUR_SLICE_COUNT;
const EDGE_MASK_SIZE = `100% ${BLUR_SLICE_COUNT * 100}%`;
const MINIMUM_BLUR_PIXELS = 8;
const INTENSITY_MULTIPLIER = 0.45;
const SATURATION = 1.08;
const OPPOSITE_EDGE = { top: 'bottom', bottom: 'top' } as const;

const getSliceIndexFromTop = (position: EdgeFadePosition, stepFromEdge: number): number =>
    position === 'top' ? stepFromEdge : BLUR_SLICE_COUNT - 1 - stepFromEdge;

export const getWebEdgeFadeBlurLayers = (
    position: EdgeFadePosition,
    config: ScreenChromeConfigInterface,
    intensity: number
): readonly WebEdgeFadeStyleInterface[] => {
    const edgeBlurPixels = Math.max(MINIMUM_BLUR_PIXELS, intensity * INTENSITY_MULTIPLIER);
    const edgeMaskImage = buildMaskImage(config.maskStops[position]);

    return Array.from({ length: BLUR_SLICE_COUNT }, (_, stepFromEdge) => {
        const backdropFilter = `blur(${edgeBlurPixels / 2 ** stepFromEdge}px) saturate(${SATURATION})`;
        const maskPosition = `0% ${(getSliceIndexFromTop(position, stepFromEdge) / (BLUR_SLICE_COUNT - 1)) * 100}%`;

        return {
            [position]: `${stepFromEdge * BLUR_SLICE_PERCENT}%`,
            [OPPOSITE_EDGE[position]]: `${(BLUR_SLICE_COUNT - 1 - stepFromEdge) * BLUR_SLICE_PERCENT}%`,
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            maskImage: edgeMaskImage,
            WebkitMaskImage: edgeMaskImage,
            maskSize: EDGE_MASK_SIZE,
            WebkitMaskSize: EDGE_MASK_SIZE,
            maskPosition,
            WebkitMaskPosition: maskPosition,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
        };
    });
};
