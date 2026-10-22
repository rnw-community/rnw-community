import { isPositiveNumber } from '@rnw-community/shared';

export const getEdgeFadeChromePlateau = (bandHeight: number, inset: number, chromeHeight: number): number =>
    isPositiveNumber(bandHeight) ? Math.min(1, (inset + chromeHeight) / bandHeight) : 1;
