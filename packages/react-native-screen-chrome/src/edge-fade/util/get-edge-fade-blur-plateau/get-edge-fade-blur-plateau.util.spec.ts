import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeBlurPlateau } from './get-edge-fade-blur-plateau.util';

describe('getEdgeFadeBlurPlateau', () => {
    it('covers the safe-area inset plus half of the configured band height', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(190, 62)).toBeCloseTo(126 / 190);
        expect(getEdgeFadeBlurPlateau(180, 34)).toBeCloseTo(107 / 180);
    });

    it('covers half of a band without a safe-area inset', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(76, 0)).toBe(0.5);
    });

    it('treats an empty band as all plateau', () => {
        expect.hasAssertions();

        expect(getEdgeFadeBlurPlateau(0, 0)).toBe(1);
    });
});
