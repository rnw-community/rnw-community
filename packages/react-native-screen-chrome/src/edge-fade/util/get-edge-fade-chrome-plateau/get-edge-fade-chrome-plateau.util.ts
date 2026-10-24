import { isPositiveNumber } from '@rnw-community/shared';

const MINIMUM_RAMP_RADII = 3;

export const getEdgeFadeChromePlateau = (bandHeight: number, inset: number, chromeHeight: number, radius: number): number =>
    isPositiveNumber(bandHeight)
        ? Math.max(inset, Math.min(inset + chromeHeight, bandHeight - MINIMUM_RAMP_RADII * radius)) / bandHeight
        : 1;
