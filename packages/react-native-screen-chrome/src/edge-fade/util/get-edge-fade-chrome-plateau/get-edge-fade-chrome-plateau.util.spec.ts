import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeChromePlateau } from './get-edge-fade-chrome-plateau.util';

const BAND = 190;
const HEADER = 64;
const STATUS_BAR_INSET = 62;
const HOME_INDICATOR_INSET = 34;

describe('getEdgeFadeChromePlateau', () => {
    it('holds the full blur over the safe-area inset plus the chrome height', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(BAND, STATUS_BAR_INSET, HEADER)).toBeCloseTo((STATUS_BAR_INSET + HEADER) / BAND);
        expect(getEdgeFadeChromePlateau(BAND, HOME_INDICATOR_INSET, 0)).toBeCloseTo(HOME_INDICATOR_INSET / BAND);
    });

    it('never exceeds the whole band', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(HEADER, STATUS_BAR_INSET, HEADER)).toBe(1);
    });

    it('treats an empty band as all plateau', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(0, 0, 0)).toBe(1);
    });
});
