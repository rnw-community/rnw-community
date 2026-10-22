import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeBlurPlateau } from './get-edge-fade-blur-plateau.util';

const TALL_BAND = 190;
const SHORT_BAND = 180;
const STATUS_BAR_INSET = 62;
const HOME_INDICATOR_INSET = 34;

describe('getEdgeFadeBlurPlateau', () => {
    it('covers the safe-area inset plus half of the configured band height', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(TALL_BAND, STATUS_BAR_INSET)).toBeCloseTo(
            (TALL_BAND + STATUS_BAR_INSET) / (2 * TALL_BAND)
        );
        expect(getEdgeFadeBlurPlateau(SHORT_BAND, HOME_INDICATOR_INSET)).toBeCloseTo(
            (SHORT_BAND + HOME_INDICATOR_INSET) / (2 * SHORT_BAND)
        );
    });

    it('covers half of a band without a safe-area inset', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(SHORT_BAND, 0)).toBe(0.5);
    });

    it('treats an empty band as all plateau', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(0, 0)).toBe(1);
    });
});
