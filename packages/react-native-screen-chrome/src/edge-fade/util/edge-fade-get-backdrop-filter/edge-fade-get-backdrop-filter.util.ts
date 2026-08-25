const MINIMUM_BLUR_PIXELS = 8;
const INTENSITY_MULTIPLIER = 0.45;
const SATURATION = 1.08;

export const getEdgeFadeBackdropFilter = (intensity: number): string => {
    const blurPixels = Math.max(MINIMUM_BLUR_PIXELS, intensity * INTENSITY_MULTIPLIER);

    return `blur(${blurPixels}px) saturate(${SATURATION})`;
};
