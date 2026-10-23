import type { EdgeFadePosition } from '../../edge-fade-position.type';
import type { WebEdgeFadeStyleInterface } from '../../web-edge-fade-style.interface';

const MASK_STEPS = 12;
const SATURATION = 1.08;
const EDGE_PADDING_RADII = 2;
const OPPOSITE_EDGE = { top: 'bottom', bottom: 'top' } as const;
const MASK_DIRECTION = { top: 'to bottom', bottom: 'to top' } as const;

const toPercent = (fraction: number): string => `${Number((fraction * 100).toFixed(4))}%`;

export const getWebEdgeFadeBlurLayers = (
    position: EdgeFadePosition,
    radius: number,
    height: number,
    plateau: number
): readonly WebEdgeFadeStyleInterface[] => {
    const padding = (EDGE_PADDING_RADII * radius) / height;
    const stops = Array.from({ length: MASK_STEPS + 1 }, (_, step) => {
        const progress = step / MASK_STEPS;
        const opacity = Number(((1 - progress) ** 2 * (1 + 2 * progress)).toFixed(4));
        const offset = (plateau + (1 - plateau) * progress) / (1 + padding);

        return `rgba(0,0,0,${opacity}) ${toPercent(offset)}`;
    });
    const maskImage = `linear-gradient(${MASK_DIRECTION[position]}, #000000 0%, ${stops.join(', ')})`;
    const backdropFilter = `blur(${radius}px) saturate(${SATURATION})`;

    return [
        {
            [position]: '0%',
            [OPPOSITE_EDGE[position]]: toPercent(-padding),
            backdropFilter,
            WebkitBackdropFilter: backdropFilter,
            maskImage,
            WebkitMaskImage: maskImage,
        },
    ];
};
