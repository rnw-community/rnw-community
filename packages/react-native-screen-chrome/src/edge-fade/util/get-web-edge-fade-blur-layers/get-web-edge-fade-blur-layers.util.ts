import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

const BLUR_LAYER_COUNT = 4;
const SATURATION = 1.08;
const EDGE_PADDING_RADII = 2;
const OPPOSITE_EDGE = { top: 'bottom', bottom: 'top' } as const;
const MASK_DIRECTION = { top: 'to bottom', bottom: 'to top' } as const;

const toPercent = (fraction: number): string => `${Number((fraction * 100).toFixed(4))}%`;

const toMaskStop = (color: string, offset: number, start: number, end: number): string =>
    `${color} ${toPercent((offset - start) / (end - start))}`;

export const getWebEdgeFadeBlurLayers = (
    position: EdgeFadePosition,
    radius: number,
    height: number,
    plateau: number
): readonly WebEdgeFadeStyleInterface[] => {
    const rampStep = (1 - plateau) / BLUR_LAYER_COUNT;

    return Array.from({ length: BLUR_LAYER_COUNT }, (_, stepFromEdge) => {
        const layerRadius = radius / 2 ** stepFromEdge;
        const padding = (EDGE_PADDING_RADII * layerRadius) / height;
        const fadeInStart = plateau + (stepFromEdge - 2) * rampStep;
        const fadeOutStart = plateau + stepFromEdge * rampStep;
        const fadeOutEnd = fadeOutStart + rampStep;
        const start = stepFromEdge === 0 ? 0 : fadeInStart - padding;
        const end = fadeOutEnd + padding;
        const opaqueStops =
            stepFromEdge === 0
                ? ['#000000 0%', toMaskStop('#000000', fadeOutStart, start, end)]
                : [
                      toMaskStop('transparent', fadeInStart, start, end),
                      toMaskStop('#000000', fadeInStart + rampStep, start, end),
                      toMaskStop('#000000', fadeOutStart, start, end),
                  ];
        const maskImage = `linear-gradient(${MASK_DIRECTION[position]}, ${[...opaqueStops, toMaskStop('transparent', fadeOutEnd, start, end)].join(', ')})`;
        const backdropFilter = `blur(${layerRadius}px) saturate(${SATURATION})`;

        return {
            [position]: toPercent(start),
            [OPPOSITE_EDGE[position]]: toPercent(1 - end),
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            maskImage,
            WebkitMaskImage: maskImage,
        };
    });
};
