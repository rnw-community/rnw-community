import { isPositiveNumber } from '@rnw-community/shared';

export const getEdgeFadeBlurPlateau = (height: number, inset: number): number =>
    isPositiveNumber(height) ? (height + inset) / (2 * height) : 1;
