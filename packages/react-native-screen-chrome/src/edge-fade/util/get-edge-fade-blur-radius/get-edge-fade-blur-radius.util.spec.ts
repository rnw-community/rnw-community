import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeBlurRadius } from './get-edge-fade-blur-radius.util';

describe('getEdgeFadeBlurRadius', () => {
    it('derives the radius from the band intensity, then the provider intensity', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurRadius(40, void 0, SCREEN_CHROME_DEFAULT_CONFIG)).toBe(18);
        expect(getEdgeFadeBlurRadius(void 0, { opacityInputRange: [0, 80] }, SCREEN_CHROME_DEFAULT_CONFIG)).toBe(22.5);
    });

    it('uses the scroll-driven maximum intensity while an intensity range animates the blur', () => {
        expect.hasAssertions();

        expect(
            getEdgeFadeBlurRadius(40, { intensityInputRange: [0, 80], maxIntensity: 60 }, SCREEN_CHROME_DEFAULT_CONFIG)
        ).toBe(27);
        expect(getEdgeFadeBlurRadius(40, { intensityInputRange: [0, 80] }, SCREEN_CHROME_DEFAULT_CONFIG)).toBeCloseTo(23.4);
    });

    it('never drops below the minimum radius', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurRadius(0, void 0, SCREEN_CHROME_DEFAULT_CONFIG)).toBe(8);
    });
});
