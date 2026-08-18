import { describe, expect, it } from '@jest/globals';

import { SCREEN_CHROME_DEFAULT_CONFIG } from '../../../constant/screen-chrome-default-config.constant';

import { getEdgeFadeMaskStops } from './edge-fade-get-mask-stops.util';

describe('getEdgeFadeMaskStops', () => {
    it('eases the top mask from the configured opaque stop to the configured transparent stop', () => {
        expect.hasAssertions();

        const gradient = getEdgeFadeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops, 'top');

        expect(gradient.colors).toHaveLength(28);
        expect(gradient.locations).toHaveLength(28);
        expect(gradient.colors.at(0)).toBe('rgba(0, 0, 0, 0.988)');
        expect(gradient.colors.at(13)).toBe('rgba(0, 0, 0, 1)');
        expect(gradient.colors.at(-1)).toBe('rgba(0, 0, 0, 0)');
        expect(gradient.locations.at(0)).toBe(0);
        expect(gradient.locations.at(13)).toBe(0.5);
        expect(gradient.locations.at(-1)).toBe(1);
        expect([...gradient.locations].sort((first, second) => first - second)).toEqual(gradient.locations);
    });

    it('eases the bottom mask in the mirrored direction', () => {
        expect.hasAssertions();

        const gradient = getEdgeFadeMaskStops(SCREEN_CHROME_DEFAULT_CONFIG.maskStops, 'bottom');

        expect(gradient.colors.at(0)).toBe('rgba(0, 0, 0, 0)');
        expect(gradient.colors.at(-1)).toBe('rgba(0, 0, 0, 0.988)');
        expect(gradient.locations.at(0)).toBe(0);
        expect(gradient.locations.at(-1)).toBe(1);
    });
});
