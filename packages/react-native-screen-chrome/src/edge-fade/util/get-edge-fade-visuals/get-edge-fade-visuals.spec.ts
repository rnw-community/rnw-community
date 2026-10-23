import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeVisuals } from './get-edge-fade-visuals.util';

const EDGE_FADE_BAND_HEIGHT = 126;
const EDGE_FADE_CHROME_HEIGHT = 102;
const QUARTER_RAMP_STOP = 6;
const MID_RAMP_STOP = 12;
const THREE_QUARTER_RAMP_STOP = 18;
const TOP_MASK_COLORS = ['#000000', 'rgba(0,0,0,0.56)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.06)', 'transparent'];
const BOTTOM_MASK_COLORS = ['transparent', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.56)', '#000000'];

describe('getEdgeFadeVisuals', () => {
    it('orders the wash from solid to wash at the top edge', () => {
        expect.hasAssertions();

        const { washColors } = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG);

        expect(washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
        ]);
    });

    it('mirrors the wash order at the bottom edge', () => {
        expect.hasAssertions();

        const { washColors } = getEdgeFadeVisuals('bottom', 'light', SCREEN_CHROME_DEFAULT_CONFIG);

        expect(washColors).toEqual([
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.wash,
            SCREEN_CHROME_DEFAULT_CONFIG.colors.light.solid,
        ]);
    });

    it('starts the top wash ramp at the safe inset and collapsed chrome boundary', () => {
        expect.hasAssertions();

        const [edge, quarter, midpoint, threeQuarter, inner] = getEdgeFadeVisuals(
            'top',
            'light',
            SCREEN_CHROME_DEFAULT_CONFIG,
            EDGE_FADE_CHROME_HEIGHT / EDGE_FADE_BAND_HEIGHT
        ).maskLocations;

        expect(edge).toBe(EDGE_FADE_CHROME_HEIGHT / EDGE_FADE_BAND_HEIGHT);
        expect(quarter).toBeCloseTo((EDGE_FADE_CHROME_HEIGHT + QUARTER_RAMP_STOP) / EDGE_FADE_BAND_HEIGHT);
        expect(midpoint).toBe((EDGE_FADE_CHROME_HEIGHT + MID_RAMP_STOP) / EDGE_FADE_BAND_HEIGHT);
        expect(threeQuarter).toBe((EDGE_FADE_CHROME_HEIGHT + THREE_QUARTER_RAMP_STOP) / EDGE_FADE_BAND_HEIGHT);
        expect(inner).toBe(1);
    });

    it('finishes the bottom wash ramp before the collapsed chrome plateau', () => {
        expect.hasAssertions();

        const [inner, quarter, midpoint, threeQuarter, edge] = getEdgeFadeVisuals(
            'bottom',
            'light',
            SCREEN_CHROME_DEFAULT_CONFIG,
            EDGE_FADE_CHROME_HEIGHT / EDGE_FADE_BAND_HEIGHT
        ).maskLocations;

        expect(inner).toBe(0);
        expect(quarter).toBeCloseTo(QUARTER_RAMP_STOP / EDGE_FADE_BAND_HEIGHT);
        expect(midpoint).toBe(MID_RAMP_STOP / EDGE_FADE_BAND_HEIGHT);
        expect(threeQuarter).toBeCloseTo(THREE_QUARTER_RAMP_STOP / EDGE_FADE_BAND_HEIGHT);
        expect(edge).toBe((EDGE_FADE_BAND_HEIGHT - EDGE_FADE_CHROME_HEIGHT) / EDGE_FADE_BAND_HEIGHT);
    });

    it('preserves the top mask endpoint and stop ordering when the chrome fills the band', () => {
        expect.hasAssertions();

        const { maskColors, maskLocations } = getEdgeFadeVisuals('top', 'light', SCREEN_CHROME_DEFAULT_CONFIG, 1);

        expect(maskColors).toEqual(TOP_MASK_COLORS);
        expect(maskLocations).toEqual([1, 1, 1, 1, 1]);
    });

    it('preserves the bottom mask endpoint and stop ordering when the chrome fills the band', () => {
        expect.hasAssertions();

        const { maskColors, maskLocations } = getEdgeFadeVisuals('bottom', 'light', SCREEN_CHROME_DEFAULT_CONFIG, 1);

        expect(maskColors).toEqual(BOTTOM_MASK_COLORS);
        expect(maskLocations).toEqual([0, 0, 0, 0, 0]);
    });
});
