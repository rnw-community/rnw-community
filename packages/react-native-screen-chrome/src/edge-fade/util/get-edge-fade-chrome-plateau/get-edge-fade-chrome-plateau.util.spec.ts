import { describe, expect, it } from '@jest/globals';

import { getEdgeFadeChromePlateau } from './get-edge-fade-chrome-plateau.util';

describe('getEdgeFadeChromePlateau', () => {
    it('holds the full blur over the safe-area inset plus the chrome height', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(190, 62, 64)).toBeCloseTo(126 / 190);
        expect(getEdgeFadeChromePlateau(118, 34, 0)).toBeCloseTo(34 / 118);
    });

    it('never exceeds the whole band', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(80, 62, 64)).toBe(1);
    });

    it('treats an empty band as all plateau', () => {
        expect.hasAssertions();

        expect(getEdgeFadeChromePlateau(0, 0, 0)).toBe(1);
    });
});
