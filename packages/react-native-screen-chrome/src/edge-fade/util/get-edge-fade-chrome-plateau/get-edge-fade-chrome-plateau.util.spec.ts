import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeChromePlateau } from './get-edge-fade-chrome-plateau.util';

const STATUS_BAR_INSET = 62;
const HOME_INDICATOR_INSET = 34;
const MINIMUM_RAMP_RADII = 3;
const COMPACT_RADIUS = 13.5;
const TALL_RADIUS = 22.5;
const COMPACT_BAND = 118;
const TAB_BAND = 126;
const TALL_BAND = 190;
const RAMP_LENGTH = 40.5;
const CHROME_HEIGHT = 32;
const TAB_CHROME_HEIGHT = 68;
const TALL_CHROME_HEIGHT = 64;
const SHORT_BAND = 30;
const EPSILON = 1e-9;
const GEOMETRIES = [
    { name: 'compact header backdrop', height: 56, inset: STATUS_BAR_INSET, chromeHeight: 32, radius: COMPACT_RADIUS },
    { name: 'tab bar fade', height: 92, inset: HOME_INDICATOR_INSET, chromeHeight: 68, radius: COMPACT_RADIUS },
    { name: 'tall header band', height: 128, inset: STATUS_BAR_INSET, chromeHeight: 32, radius: TALL_RADIUS },
    { name: 'tall tab bar band', height: 120, inset: HOME_INDICATOR_INSET, chromeHeight: 68, radius: COMPACT_RADIUS },
    { name: 'chrome-free band', height: 150, inset: 0, chromeHeight: 0, radius: TALL_RADIUS },
    { name: 'minimum radius band', height: 40, inset: 0, chromeHeight: 16, radius: 8 },
];

describe('getEdgeFadeChromePlateau', () => {
    it.each(GEOMETRIES)(
        'keeps the $name plateau between the safe area and the chrome and ramps over at least three blur radii',
        ({ height, inset, chromeHeight, radius }) => {
            expect.hasAssertions();

            const band = height + inset;
            const plateau = getEdgeFadeChromePlateau(band, inset, chromeHeight, radius);

            expect(plateau * band).toBeLessThanOrEqual(inset + chromeHeight + EPSILON);
            expect((1 - plateau) * band).toBeGreaterThanOrEqual(Math.min(height, MINIMUM_RAMP_RADII * radius) - EPSILON);
            expect(plateau * band).toBeGreaterThanOrEqual(inset - EPSILON);
        }
    );

    it('pulls the compact header plateau inward so its ramp spans three radii', () => {
        expect.hasAssertions();

        expect(
            getEdgeFadeChromePlateau(COMPACT_BAND, STATUS_BAR_INSET, CHROME_HEIGHT, COMPACT_RADIUS) * COMPACT_BAND
        ).toBeCloseTo(COMPACT_BAND - RAMP_LENGTH);
        expect(
            getEdgeFadeChromePlateau(TAB_BAND, HOME_INDICATOR_INSET, TAB_CHROME_HEIGHT, COMPACT_RADIUS) * TAB_BAND
        ).toBeCloseTo(TAB_BAND - RAMP_LENGTH);
    });

    it('holds the full blur over the safe-area inset plus the chrome height when the band leaves room to ramp', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(TALL_BAND, STATUS_BAR_INSET, TALL_CHROME_HEIGHT, COMPACT_RADIUS)).toBeCloseTo(
            (STATUS_BAR_INSET + TALL_CHROME_HEIGHT) / TALL_BAND
        );
        expect(getEdgeFadeChromePlateau(TALL_BAND, HOME_INDICATOR_INSET, 0, COMPACT_RADIUS)).toBeCloseTo(
            HOME_INDICATOR_INSET / TALL_BAND
        );
    });

    it('ramps across the whole band below the safe area when it is shorter than three radii', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(SHORT_BAND, 0, SHORT_BAND, COMPACT_RADIUS)).toBe(0);
        expect(getEdgeFadeChromePlateau(COMPACT_BAND, STATUS_BAR_INSET, CHROME_HEIGHT, TALL_RADIUS)).toBeCloseTo(
            STATUS_BAR_INSET / COMPACT_BAND
        );
    });

    it('treats an empty band as all plateau', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(0, 0, 0, 8)).toBe(1);
    });
});
